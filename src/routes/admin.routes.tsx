import type { RouteObject } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminCourses from "../pages/admin/Courses";
import AdminProfiles from "../pages/admin/Profiles";
import AdminOrganizations from "../pages/admin/Organizations";

export const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "admin/users",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminUsers />
      </ProtectedRoute>
    )
  },
  {
    path: "admin/courses",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminCourses />
      </ProtectedRoute>
    )
  },
  {
    path: "admin/profiles",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminProfiles />
      </ProtectedRoute>
    )
  },
  {
    path: "admin/organizations",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminOrganizations />
      </ProtectedRoute>
    )
  },
];