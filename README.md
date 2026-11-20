# LearnHub – MERN Stack Learning Management System

LearnHub is a full-stack Learning Management System. Students browse and enroll in courses and track progress, instructors create and manage courses and lessons, and admins manage users and view analytics.

## Technologies
- **Frontend:** React 19, Vite, React Router, Axios, Tailwind CSS 4
- **Backend:** Node.js, Express 5, Mongoose (MongoDB)
- **Auth:** JWT (jsonwebtoken), bcrypt password hashing (bcryptjs), role-based middleware
- **Config:** dotenv (`.env`)

## Features
| Role | Can do |
|---|---|
| Visitor | Browse/search courses, view course dewtails, register, login |
| Student | Enroll, view enrolled courses (`/my-courses`), mark lessons complete (progress %) |
| Instructor | Create / edit / delete own courses, add / delete lessons |
| Admin | Manage all users (change role, delete) and courses, view analytics |

## Project structure
```
learnhub/
├── backend/
│   ├── config/db.js            MongoDB connection
│   ├── models/                 User, Course, Enrollment
│   ├── controllers/            auth, course, enrollment, admin
│   ├── routes/                 auth, course, enrollment, admin
│   ├── middleware/             auth (protect/authorize), optionalAuth, error
│   ├── tests/api.test.js       35 end-to-end API checks
│   ├── app.js, server.js, seed.js
│   └── .env.example
└── frontend/
    └── src/
        ├── components/         Navbar, CourseCard, modals, Loader
        ├── pages/              Home, CourseList, CourseDetail, Login, Register, dashboards
        ├── routes/ProtectedRoute.jsx
        ├── context/AuthContext.jsx
        └── services/           axios instance + API services
```

## Installation
Prerequisites: Node.js 18+, MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # then set JWT_SECRET and MONGO_URI
npm run seed                # demo data (optional)
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173  (proxies /api to :5000)
```

### Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@learnhub.com | admin123 |
| Instructor | sara@learnhub.com | instructor123 |
| Student | ali@learnhub.com | student123 |

### Environment variables (`backend/.env`)
| Name | Description |
|---|---|
| PORT | API port (default 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret used to sign tokens (never commit) |
| JWT_EXPIRES_IN | Token lifetime, e.g. `7d` |
| CLIENT_URL | Allowed CORS origin(s), comma separated |
| NODE_ENV | `development` or `production` |

## Production build / deployment
```bash
cd frontend && npm run build          # creates frontend/dist
cd ../backend && NODE_ENV=production npm start
```
In production mode Express serves `frontend/dist`, so one service hosts the whole app (works on Render/Railway etc. with a MongoDB Atlas `MONGO_URI`). If the frontend is hosted separately, set `VITE_API_URL` in the frontend and `CLIENT_URL` in the backend.

## API reference
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/register | public (role limited to student/instructor) |
| POST | /api/login | public |
| GET | /api/me | any logged-in user |
| GET | /api/courses?search=&category= | public |
| GET | /api/courses/:id | public (lesson content only for enrolled/owner/admin) |
| POST | /api/courses | instructor, admin |
| PUT | /api/courses/:id | owner, admin |
| DELETE | /api/courses/:id | owner, admin |
| POST / DELETE | /api/courses/:id/lessons[/:lessonId] | owner, admin |
| POST | /api/enroll | student |
| GET | /api/my-courses | student |
| PUT | /api/my-courses/:courseId/progress | student |
| GET | /api/admin/users, /api/admin/analytics | admin |
| PUT | /api/admin/users/:id/role | admin |
| DELETE | /api/admin/users/:id | admin |

## Testing
`cd backend && npm test` runs 35 automated end-to-end checks (register/login, validation, role restrictions, course CRUD, enrollment, progress, admin) against a separate `learnhub_test` database.
