import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex min-h-[68px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="flex items-center text-xl font-extrabold tracking-tight text-slate-900 no-underline"
        >
          <span className="mr-2 grid size-[34px] place-items-center rounded-[11px] bg-gradient-to-br from-violet-400 to-violet-700 text-base text-white shadow-md shadow-violet-200">
            L
          </span>
          LearnHub
        </Link>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
        <div
          className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-3 pb-4 md:flex md:w-auto md:flex-row md:items-center md:pb-0`}
        >
          <div className="flex flex-col gap-1 md:flex-row">
            <NavLink to="/" end className={navClass} onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/courses" className={navClass} onClick={() => setMenuOpen(false)}>
              Courses
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navClass} onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
            )}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {user ? (
              <>
                <span className="flex items-center gap-2 px-2 text-sm font-semibold text-slate-700">
                  {user.name}
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-violet-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
