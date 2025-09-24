import type { RouteObject } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import StudentDashboard from "../pages/student/Dashboard";

export const studentRoutes: RouteObject[] = [
  {
    path: "student",
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
];