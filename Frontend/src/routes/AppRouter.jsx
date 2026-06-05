import { Routes, Route, Navigate } from "react-router-dom";
import { RoleRoute } from "./Guards";
import JobDetails from "../pages/JobDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import UserDashboard from "../pages/UserDashboard";
import HRDashboard from "../pages/HRDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import HRJobApplicants from "../pages/HRJobApplicants";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
<Route
  path="/user/jobs/:jobId"
  element={
    <RoleRoute allowedRoles={["USER", "CANDIDATE"]}>
      <JobDetails />
    </RoleRoute>
  }
/>
      <Route
        path="/user"
        element={
          <RoleRoute allowedRoles={["USER", "CANDIDATE"]}>
            <UserDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/hr"
        element={
          <RoleRoute allowedRoles={["HR"]}>
            <HRDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/hr/jobs/:jobId"
        element={
          <RoleRoute allowedRoles={["HR"]}>
            <HRJobApplicants />
          </RoleRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
    </Routes>
  );
}