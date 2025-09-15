import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import LandingPage from "./landing";
import RootLayout from "../app.layout";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleBasedRedirect from "../components/RoleBasedRedirect";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "./NotFound";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import ForgotPassword from "./auth/ForgotPassword";
import AdminDashboard from "./admin/Dashboard";
import AdminUsers from "./admin/Users";
import AdminCourses from "./admin/Courses";
import InstructorDashboard from "./instructor/Dashboard";
import InstructorCourses from "./instructor/Courses";
import CourseBuilder from "./instructor/CourseBuilder";
import StudentDashboard from "./student/Dashboard";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  // Routes d'authentification (sans layout)
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <SignIn /> },
  { path: "/register", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  // Redirection /auth vers /auth/signin
  { path: "/auth", element: <Navigate to="/auth/signin" replace /> },
  // Routes alternatives avec préfixe auth
  { path: "/auth/signin", element: <SignIn /> },
  { path: "/auth/login", element: <SignIn /> },
  { path: "/auth/signup", element: <SignUp /> },
  { path: "/auth/register", element: <SignUp /> },
  { path: "/auth/forgot-password", element: <ForgotPassword /> },
  // Routes du dashboard avec layout
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      // Redirection selon le rôle utilisateur
      { path: "", element: <RoleBasedRedirect /> },
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
        path: "student",
        element: (
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
