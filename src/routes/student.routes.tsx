import type { RouteObject } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/MyCourses";
import Progress from "../pages/student/Progress";

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
];