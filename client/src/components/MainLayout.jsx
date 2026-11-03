
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FC]">

      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ml-[250px] min-h-screen">

        {/* Top navigation */}
        <Topbar />

        {/* Page content */}
        <main className="min-h-[calc(100vh-72px)] p-5 sm:p-7 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
