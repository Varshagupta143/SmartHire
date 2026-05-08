import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute, ProtectedRoute } from "./Guards";

import Login from "../pages/Login";
import Register from "../pages/Register";
import UserDashboard from "../pages/UserDashboard";
import JobDetailPage from "../pages/JobDetailPage";
import HRDashboard from "../pages/HRDashboard";
import HRJobApplicants from "../pages/HRJobApplicants";
import AdminDashboard from "../pages/AdminDashboard";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Candidate routes */}
      <Route path="/user"           element={<ProtectedRoute allowedRoles={["USER","CANDIDATE"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/jobs/:id"  element={<ProtectedRoute allowedRoles={["USER","CANDIDATE"]}><JobDetailPage /></ProtectedRoute>} />

      {/* HR routes */}
      <Route path="/hr"                  element={<ProtectedRoute allowedRoles={["HR","ADMIN"]}><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/jobs/:jobId"      element={<ProtectedRoute allowedRoles={["HR","ADMIN"]}><HRJobApplicants /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
