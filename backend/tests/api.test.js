// End-to-end API test. Run with the server stopped or running on another port:  npm test
// Uses a separate database (learnhub_test) so your data is untouched.
process.env.NODE_ENV = 'test';
require('dotenv').config({ quiet: true });
process.env.MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnhub').replace(/\/[^/]*$/, '/learnhub_test');

const mongoose = require('mongoose');
const http = require('http');
const app = require('../app');
const User = require('../models/User');

let passed = 0, failed = 0;
const check = (name, cond, extra = '') => {
  cond ? passed++ : failed++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`);
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
  const server = http.createServer(app).listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const call = async (method, path, body, token) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  };

  // --- Register / login ---
  let r = await call('POST', '/register', { name: 'Stu', email: 'stu@x.com', password: 'secret1' });
  check('register student -> 201 + token', r.status === 201 && !!r.data.token && r.data.user.role === 'student');
  const stuToken = r.data.token;
  r = await call('POST', '/register', { name: 'Stu', email: 'stu@x.com', password: 'secret1' });
  check('duplicate email -> 409', r.status === 409, JSON.stringify(r.data));
  r = await call('POST', '/register', { name: 'A', email: 'bad', password: '123' });
  check('invalid register input -> 400', r.status === 400);
  r = await call('POST', '/register', { name: 'Hacker', email: 'h@x.com', password: 'secret1', role: 'admin' });
  check('cannot self-register as admin (role forced to student)', r.data.user.role === 'student');
  r = await call('POST', '/register', { name: 'Ins', email: 'ins@x.com', password: 'secret1', role: 'instructor' });
  const insToken = r.data.token;
  check('register instructor', r.data.user.role === 'instructor');

  const stored = await User.findOne({ email: 'stu@x.com' }).select('+password');
  check('password stored as bcrypt hash', stored.password.startsWith('$2') && stored.password !== 'secret1');

  r = await call('POST', '/login', { email: 'stu@x.com', password: 'wrong' });
  check('wrong password -> 401', r.status === 401);
  r = await call('POST', '/login', { email: 'stu@x.com', password: 'secret1' });
  check('login ok -> token', r.status === 200 && !!r.data.token);

  // admin via DB (cannot self-register)
  await User.create({ name: 'Root', email: 'root@x.com', password: 'secret1', role: 'admin' });
  r = await call('POST', '/login', { email: 'root@x.com', password: 'secret1' });
  const adminToken = r.data.token;

  // --- Protected routes ---
  r = await call('GET', '/me');
  check('GET /me without token -> 401', r.status === 401);
  r = await call('GET', '/me', null, 'garbage');
  check('GET /me with bad token -> 401', r.status === 401);
  r = await call('GET', '/me', null, stuToken);
  check('GET /me with token -> 200', r.status === 200 && r.data.email === 'stu@x.com');

  // --- Course CRUD ---
  r = await call('POST', '/courses', { title: 'T', description: 'D', category: 'C', price: 10 }, stuToken);
  check('student cannot create course -> 403', r.status === 403);
  r = await call('POST', '/courses', { title: 'T' }, insToken);
  check('course with missing fields -> 400', r.status === 400, JSON.stringify(r.data));
  r = await call('POST', '/courses', { title: 'Intro', description: 'Desc', category: 'Web', price: 20 }, insToken);
  check('instructor creates course -> 201', r.status === 201 && r.data.title === 'Intro');
  const courseId = r.data._id;
  r = await call('GET', '/courses');
  check('GET /courses lists course', r.status === 200 && r.data.length === 1 && r.data[0].instructor.name === 'Ins');
  r = await call('PUT', `/courses/${courseId}`, { price: 25 }, insToken);
  check('owner updates course', r.status === 200 && r.data.price === 25);
  r = await call('PUT', `/courses/${courseId}`, { price: 1 }, stuToken);
  check('student cannot update course -> 403', r.status === 403);
  r = await call('GET', '/courses/not-an-id');
  check('invalid id -> 400', r.status === 400);

  // lessons
  r = await call('POST', `/courses/${courseId}/lessons`, { title: 'L1', content: 'secret notes' }, insToken);
  check('instructor adds lesson', r.status === 201);
  await call('POST', `/courses/${courseId}/lessons`, { title: 'L2', content: 'more' }, insToken);
  r = await call('GET', `/courses/${courseId}`);
  check('anonymous cannot see lesson content', r.data.lessons.length === 2 && r.data.lessons[0].content === undefined);

  // --- Enrollment ---
  r = await call('POST', '/enroll', { courseId }, insToken);
  check('instructor cannot enroll -> 403', r.status === 403);
  r = await call('POST', '/enroll', { courseId: '507f1f77bcf86cd799439011' }, stuToken);
  check('enroll in missing course -> 404', r.status === 404);
  r = await call('POST', '/enroll', { courseId }, stuToken);
  check('student enrolls -> 201', r.status === 201);
  r = await call('POST', '/enroll', { courseId }, stuToken);
  check('double enroll -> 409', r.status === 409);
  r = await call('GET', '/my-courses', null, stuToken);
  check('GET /my-courses returns enrolled course', r.status === 200 && r.data.length === 1 && r.data[0].course.title === 'Intro');
  r = await call('GET', `/courses/${courseId}`, null, stuToken);
  check('enrolled student can see lesson content', r.data.lessons[0].content === 'secret notes');

  const lessonId = r.data.lessons[0]._id;
  r = await call('PUT', `/my-courses/${courseId}/progress`, { lessonId, completed: true }, stuToken);
  check('progress updates to 50%', r.status === 200 && r.data.progress === 50);

  // --- Admin ---
  r = await call('GET', '/admin/analytics', null, stuToken);
  check('student blocked from analytics -> 403', r.status === 403);
  r = await call('GET', '/admin/analytics', null, adminToken);
  check('admin analytics', r.status === 200 && r.data.totals.courses === 1 && r.data.totals.enrollments === 1);
  r = await call('GET', '/admin/users', null, adminToken);
  check('admin lists users', r.status === 200 && r.data.length === 4);
  const stu = r.data.find((u) => u.email === 'stu@x.com');
  r = await call('PUT', `/admin/users/${stu._id}/role`, { role: 'instructor' }, adminToken);
  check('admin changes role', r.status === 200 && r.data.role === 'instructor');
  r = await call('PUT', `/admin/users/${stu._id}/role`, { role: 'superhero' }, adminToken);
  check('invalid role -> 400', r.status === 400);

  // --- Delete ---
  r = await call('DELETE', `/courses/${courseId}`, null, stuToken);
  check('non-owner cannot delete -> 403', r.status === 403);
  r = await call('DELETE', `/courses/${courseId}`, null, insToken);
  check('owner deletes course', r.status === 200);
  r = await call('GET', '/nope');
  check('unknown route -> 404', r.status === 404);

  console.log(`\n${passed} passed, ${failed} failed`);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
  process.exit(failed ? 1 : 0);
})();
