import type { RouteObject } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";
import InstructorDashboard from "../pages/instructor/Dashboard";
import InstructorCourses from "../pages/instructor/Courses";
import CourseBuilder from "../pages/instructor/CourseBuilder";
import InstructorProfile from "../pages/instructor/InstructorProfileNew";
import InstructorStudents from "../pages/instructor/Students";
import CoursePreview from "../components/course-preview/CoursePreview";

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
  {
    path: "instructor/profile",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <InstructorProfile />
      </ProtectedRoute>
    )
  },
  {
    path: "instructor/students",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <InstructorStudents />
      </ProtectedRoute>
    )
  },
  {
    path: "instructor/course/:courseId",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <CoursePreview />
      </ProtectedRoute>
    )
  },
];