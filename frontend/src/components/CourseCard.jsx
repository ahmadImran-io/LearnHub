import { Link } from 'react-router-dom';
import { UserRound, BookOpen } from 'lucide-react';

const COLORS = ['#4f46e5', '#0891b2', '#db2777', '#d97706', '#059669', '#7c3aed'];

const colorFor = (s = '') =>
  COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

export default function CourseCard({ course }) {
  return (
    <article className="course-card flex h-full flex-col overflow-hidden">
      <div
        className="course-thumb flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colorFor(course.category)}, ${colorFor(course.title)})`,
        }}
      >
        <BookOpen size={42} color="white" strokeWidth={1.8} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-3 self-start rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
          {course.category}
        </span>

        <h2 className="mb-2 text-base font-bold leading-snug tracking-tight text-slate-900">
          {course.title}
        </h2>

        <p className="mb-4 flex-1 text-sm leading-6 text-slate-600">
          {course.description.length > 90
            ? course.description.slice(0, 90) + '…'
            : course.description}
        </p>

        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <UserRound size={15} className="text-violet-600" />
            {course.instructor?.name || 'Unknown Instructor'}
          </span>

          <span className="flex items-center gap-1.5">
            <BookOpen size={15} className="text-violet-600" />
            {course.lessons?.length || 0} lessons
          </span>
        </div>

        <div className="flex items-center justify-between">
          <strong className="font-bold text-violet-700">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </strong>

          <Link
            to={`/courses/${course._id}`}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-violet-700"
          >
            View course
          </Link>
        </div>
      </div>
    </article>
  );
}
