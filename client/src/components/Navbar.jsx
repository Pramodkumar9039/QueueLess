
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `cursor-pointer whitespace-nowrap text-[13px] font-medium transition-colors duration-200 ${
      isActive
        ? "text-[#141619]"
        : "text-[#141619] hover:text-[#141619]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md
           shadow-[0_4px_20px_rgba(20,22,25,0.10)]
           border-b border-[#D1D1D1]">
      <nav className="mx-auto flex min-h-[64px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-[23px] font-extrabold tracking-tight text-[#141619] transition hover:opacity-80"
        >
          QueueLess
        </Link>

        {/* Main navigation */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/dashboard" className={linkClass}>
            <span className="hidden sm:inline">Customer Dashboard</span>
            <span className="sm:hidden">Customer</span>
          </NavLink>

          <NavLink to="/staff" className={linkClass}>
            <span className="hidden sm:inline">Staff Dashboard</span>
            <span className="sm:hidden">Staff</span>
          </NavLink>
        </div>

        {/* Authentication actions */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-[160px] truncate text-[13px] font-medium text-[#141619] lg:block">
                {user?.name || "Account"}
              </span>


        <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-lg bg-[#141619] px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#141619]"
        >
        Logout
        </button>

            </>
          ) : (
            <>
              <Link
                to="/register"
                className="hidden cursor-pointer text-[13px] font-medium text-[#141619] transition hover:text-[#141619] sm:inline-block"
              >
                Register
              </Link>

              <Link
                to="/login"
                className="cursor-pointer rounded-lg bg-[#141619] px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#141619]"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
