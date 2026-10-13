
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OrganizationDetails from "./pages/OrganizationDetails";
import JoinQueue from "./pages/JoinQueue";
import QueueSuccess from "./pages/QueueSuccess";
import StaffDashboard from "./pages/StaffDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Allow only staff and admin users.
const StaffRoute = () => {
  const { user } = useAuth();

  if (user?.role !== "staff" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/organizations/:organizationId"
            element={<OrganizationDetails />}
          />

          <Route
            path="/join-queue/:serviceId"
            element={<JoinQueue />}
          />

          <Route
            path="/queue-success"
            element={<QueueSuccess />}
          />

          {/* Routes requiring login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Staff-only routes */}
            <Route element={<StaffRoute />}>
              <Route path="/staff" element={<StaffDashboard />} />
            </Route>
          </Route>

          {/* Unknown URLs return to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
