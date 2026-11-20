// Usage: npm run seed   (wipes the database and inserts demo data)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Course.deleteMany(), Enrollment.deleteMany()]);

  const admin = await User.create({ name: 'Admin User', email: 'admin@learnhub.com', password: 'admin123', role: 'admin' });
  const sara = await User.create({ name: 'Sara Khan', email: 'sara@learnhub.com', password: 'instructor123', role: 'instructor' });
  const bilal = await User.create({ name: 'Bilal Ahmed', email: 'bilal@learnhub.com', password: 'instructor123', role: 'instructor' });
  const ali = await User.create({ name: 'Ali Raza', email: 'ali@learnhub.com', password: 'student123', role: 'student' });
  const ayesha = await User.create({ name: 'Ayesha Malik', email: 'ayesha@learnhub.com', password: 'student123', role: 'student' });

  const lessons = (titles) => titles.map((t) => ({ title: t, content: `Notes for "${t}".`, videoUrl: '' }));
  const [react, node, mongo, py, ui] = await Course.create([
    { title: 'React from Scratch', description: 'Learn components, props, state and hooks by building real UIs.', category: 'Web Development', price: 49, instructor: sara._id, lessons: lessons(['JSX & Components', 'Props & State', 'useEffect & Data Fetching', 'React Router']) },
    { title: 'Node.js & Express APIs', description: 'Build secure REST APIs with Express, middleware and JWT.', category: 'Web Development', price: 59, instructor: sara._id, lessons: lessons(['Express Basics', 'Routing & Middleware', 'Authentication with JWT']) },
    { title: 'MongoDB & Mongoose', description: 'Model data, run queries and aggregations with MongoDB.', category: 'Databases', price: 39, instructor: bilal._id, lessons: lessons(['Documents & Collections', 'Mongoose Schemas', 'Aggregation Pipeline']) },
    { title: 'Python for Data Mining', description: 'Clean, explore and mine datasets using Python and pandas.', category: 'Data Science', price: 45, instructor: bilal._id, lessons: lessons(['pandas Basics', 'Data Cleaning', 'Clustering']) },
    { title: 'UI/UX Design Basics', description: 'Human-computer interaction principles and Figma workflow.', category: 'Design', price: 0, instructor: sara._id, lessons: lessons(['Usability Heuristics', 'Wireframing']) },
  ]);

  const e1 = await Enrollment.create({ student: ali._id, course: react._id });
  e1.completedLessons = [react.lessons[0]._id, react.lessons[1]._id];
  e1.progress = 50;
  await e1.save();
  await Enrollment.create({ student: ali._id, course: mongo._id });
  await Enrollment.create({ student: ayesha._id, course: react._id });
  await Enrollment.create({ student: ayesha._id, course: node._id });

  console.log('Seed complete. Demo logins:');
  console.log('  admin@learnhub.com / admin123');
  console.log('  sara@learnhub.com / instructor123');
  console.log('  ali@learnhub.com / student123');
  await mongoose.disconnect();
})();
