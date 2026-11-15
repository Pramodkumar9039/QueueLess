
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  FiGrid,
  FiUsers,
  FiCreditCard,
  FiLayers,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
      isActive
      ? "bg-[#2A2A2A] text-white"
        : "bg-[#141619] text-white hover:bg-[#D1D1D1] hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-[#3A3A3A] bg-[#141619]">

      {/* Logo */}
      <Link
        to="/"
        className="flex h-[70px] shrink-0 items-center gap-2 border-b border-[#3A3A3A] px-6"
      >
        <span className="text-[22px] font-extrabold tracking-tight text-white">
          QueueLess
        </span>
      </Link>

      {/* Navigation */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5
        [&::-webkit-scrollbar]:hidden
        [-ms-overflow-style:none]
        [scrollbar-width:none]"
      >

        {/* Main navigation */}
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[1.3px] text-white">
          Navigation
        </p>

        <nav className="space-y-1">

          <NavLink to="/#organizations" className={navClass}>
            <FiGrid size={18} />
            Explore Organizations
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/dashboard" className={navClass}>
              <FiUsers size={18} />
              Customer Dashboard
            </NavLink>
          )}

          {(user?.role === "staff" || user?.role === "admin") && (
            <NavLink to="/staff" className={navClass}>
              <FiCreditCard size={18} />
              Staff Dashboard
            </NavLink>
          )}

        </nav>

        {/* Queue operations */}
        {isAuthenticated && (
          <>
            <div className="my-4 border-t border-[#3A3A3A]" />

            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[1.3px] text-white">
              Queue Operations
            </p>

            <nav className="space-y-1">

              {(user?.role === "staff" || user?.role === "admin") && (
                <NavLink to="/admin" className={navClass}>
                  <FiLayers size={18} />
                  Queue Management
                </NavLink>
              )}

              <NavLink to="/dashboard" className={navClass}>
                <FiCreditCard size={18} />
                My Tokens
              </NavLink>

              <NavLink to="/dashboard" className={navClass}>
                <FiBell size={18} />
                Notifications
                <span className="ml-auto h-2 w-2 rounded-full bg-[#141619]" />
              </NavLink>

            </nav>
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-[#3A3A3A] px-4 py-4">

        {isAuthenticated ? (
          <div className="flex items-center gap-2 rounded-xl border border-[#D1D1D1] bg-[#FFFFFF] p-2">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141619] text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#141619]">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] capitalize text-[#141619]">
                {user?.role || "Customer"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="cursor-pointer rounded-md p-2 text-[#141619] transition hover:bg-[#D1D1D1] hover:text-white"
            >
              <FiLogOut size={16} />
            </button>

          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="flex-1 rounded-lg bg-[#141619] py-2 text-center text-xs font-semibold text-white hover:bg-[#D1D1D1] hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="flex-1 rounded-lg border border-[#D1D1D1] py-2 text-center text-xs font-semibold text-white hover:bg-[#D1D1D1] hover:text-white"
            >
              Register
            </Link>
          </div>
        )}

      </div>
    </aside>
  );
};

export default Sidebar;
