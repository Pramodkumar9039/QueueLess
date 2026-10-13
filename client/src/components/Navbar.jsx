
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full bg-white shadow-sm">
      <nav className="mx-auto flex min-h-[54px] max-w-[1440px] items-center gap-4 border-b border-[#E8EEF6] px-4 py-2.5 sm:gap-6 sm:px-6">
        {/* QueueLess Logo */}
        <Link
          to="/"
          className="shrink-0 text-[18px] font-extrabold tracking-tight text-[#1768F2]"
        >
          QueueLess
        </Link>

        {/* Navigation Links */}
        <div className="hidden shrink-0 items-center gap-4 md:flex lg:gap-5">
          <Link
            to="/"
            className="text-[12px] font-semibold text-[#182541] transition hover:text-[#1768F2]"
          >
            Home
          </Link>

          <Link
            to="/#organizations"
            className="text-[12px] font-semibold text-[#182541] transition hover:text-[#1768F2]"
          >
            Explore
          </Link>

          <Link
            to="/#how-it-works"
            className="text-[12px] font-semibold text-[#182541] transition hover:text-[#1768F2]"
          >
            How it works
          </Link>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="ml-auto flex min-w-0 max-w-[300px] flex-1 items-center gap-2 rounded-lg border border-[#E5EBF4] bg-[#F7F9FD] px-3 py-2.5"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 shrink-0 text-[#263653]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for clinics, salons, college offices..."
            aria-label="Search organizations"
            className="w-full min-w-0 bg-transparent text-[11px] text-[#263653] outline-none placeholder:text-[#8190A8]"
          />
        </form>

        {/* Location Selector */}
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-[#E5EBF4] bg-[#F7F9FD] px-3 py-2.5 text-[12px] font-medium text-[#263653] transition hover:bg-[#EFF5FC] sm:flex"
          aria-label="Selected location: Mysuru"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>

          Mysuru

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="ml-1 h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="m7 10 5 5 5-5" />
          </svg>
        </button>

        {/* Authentication Actions */}
        {isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={
                user?.role === "staff" || user?.role === "admin"
                  ? "/staff"
                  : "/dashboard"
              }
              className="hidden text-[12px] font-semibold text-[#182541] transition hover:text-[#1768F2] sm:block"
            >
              {user?.name || "Dashboard"}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg bg-[#1768F2] px-4 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#1256CF]"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="shrink-0 rounded-lg bg-[#1768F2] px-5 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#1256CF]"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
