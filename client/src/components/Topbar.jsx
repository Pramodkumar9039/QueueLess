
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";

const Topbar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const pageNames = {
    "/": "Overview",
    "/dashboard": "Customer Dashboard",
    "/staff": "Staff Dashboard",
    "/admin": "Queue Management",
    "/login": "Login",
    "/register": "Register",
  };

  const currentPage =
    pageNames[location.pathname] ||
    (location.pathname.startsWith("/organizations/")
      ? "Organization Details"
      : location.pathname.startsWith("/join-queue/")
        ? "Join Queue"
        : location.pathname === "/queue-success"
          ? "Queue Success"
          : "QueueLess");

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between gap-4 border-b border-[#D1D1D1] bg-white px-5 sm:px-8">

      {/* Page title */}
      <div className="min-w-0">
        <p className="text-[11px] text-[#141619]">
          QueueLess / <span className="font-medium text-[#141619]">{currentPage}</span>
        </p>

        <h2 className="mt-0.5 truncate text-base font-bold text-[#141619]">
          {currentPage}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">

        {/* Search */}
        <div className="hidden w-[220px] items-center gap-2 rounded-lg border border-[#D1D1D1] bg-[#FFFFFF] px-3 py-2.5 md:flex lg:w-[280px]">
          <FiSearch className="shrink-0 text-[#141619]" size={17} />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs text-[#141619] outline-none placeholder:text-[#141619]"
          />

          <span className="whitespace-nowrap rounded border border-[#D1D1D1] bg-white px-1.5 py-0.5 text-[9px] text-[#141619]">
            Ctrl K
          </span>
        </div>

        {/* Notifications */}
        {isAuthenticated && (
          <button
            type="button"
            title="Notifications"
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#D1D1D1] text-[#141619] transition hover:bg-[#F3F3F3] hover:text-[#141619]"
          >
            <FiBell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#141619]" />
          </button>
        )}

        {/* Profile */}
        {isAuthenticated ? (
          <Link
            to={
              user?.role === "admin"
                ? "/admin"
                : user?.role === "staff"
                  ? "/staff"
                  : "/dashboard"
            }
            className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-[#F3F3F3]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] text-sm font-bold text-[#141619]">
              {user?.name?.charAt(0)?.toUpperCase() || <FiUser />}
            </div>

            <div className="hidden text-left lg:block">
              <p className="max-w-[110px] truncate text-xs font-bold text-[#141619]">
                {user?.name || "Account"}
              </p>
              <p className="text-[10px] capitalize text-[#141619]">
                {user?.role || "Customer"}
              </p>
            </div>

            <FiChevronDown className="hidden text-[#141619] lg:block" size={15} />
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-[#141619] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#141619]"
          >
            Login
          </Link>
        )}

      </div>
    </header>
  );
};

export default Topbar;
