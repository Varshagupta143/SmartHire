import { Routes, Route, Navigate } from "react-router-dom";
import { RoleRoute } from "./Guards";
import JobDetails from "../pages/JobDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import UserDashboard from "../pages/UserDashboard";
import HRDashboard from "../pages/HRDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import HRJobApplicants from "../pages/HRJobApplicants";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import MyApplications from "../pages/MyApplications";
import OAuthSuccess from "../pages/OAuthSuccess";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      path="/user/applications"
      element={
        <RoleRoute allowedRoles={["USER", "CANDIDATE"]}>
          <MyApplications />
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