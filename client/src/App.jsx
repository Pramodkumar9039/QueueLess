
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import OrganizationDetails from "./pages/OrganizationDetails";
import JoinQueue from "./pages/JoinQueue";
import QueueSuccess from "./pages/QueueSuccess";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        {/* Space reserved for the fixed navbar */}
        <div className="h-[76px]" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/organizations/:organizationId" element={<OrganizationDetails />} />
          <Route path="/join-queue/:serviceId" element={<JoinQueue />} />
          <Route path="/queue-success" element={<QueueSuccess />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
