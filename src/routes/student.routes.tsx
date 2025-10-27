import type { RouteObject } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/MyCourses";
import Progress from "../pages/student/Progress";
import Catalog from "../pages/student/Catalog";
import Leaderboard from "../pages/student/Leaderboard";
import StudentProfile from "../pages/student/StudentProfileUpdated";

export const studentRoutes: RouteObject[] = [
  {
    path: "student",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "student/catalog",
    element: (
      <ProtectedRoute requiredRole="student">
        <Catalog />
      </ProtectedRoute>
    )
  },
  {
    path: "student/courses",
    element: (
      <ProtectedRoute requiredRole="student">
        <MyCourses />
      </ProtectedRoute>
    )
  },
  {
    path: "student/progress",
    element: (
      <ProtectedRoute requiredRole="student">
        <Progress />
      </ProtectedRoute>
    )
  },
  {
    path: "student/leaderboard",
    element: (
      <ProtectedRoute requiredRole="student">
        <Leaderboard />
      </ProtectedRoute>
    )
  },
  {
    path: "student/profile",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentProfile />
      </ProtectedRoute>
    )
  },
];