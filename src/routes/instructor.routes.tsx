import type { RouteObject } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import InstructorDashboard from "../pages/instructor/Dashboard";
import InstructorCourses from "../pages/instructor/Courses";
import CourseBuilder from "../pages/instructor/CourseBuilder";

export const instructorRoutes: RouteObject[] = [
  {
    path: "instructor",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <InstructorDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "instructor/courses",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <InstructorCourses />
      </ProtectedRoute>
    )
  },
  {
    path: "instructor/course-builder",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <CourseBuilder />
      </ProtectedRoute>
    )
  },
  {
    path: "instructor/course-builder/:courseId",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <CourseBuilder />
      </ProtectedRoute>
    )
  },
];