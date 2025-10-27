import { Navigate, type RouteObject } from "react-router";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import OrganizationSignUp from "../pages/auth/OrganizationSignUp";
import ForgotPassword from "../pages/auth/ForgotPassword";

export const authRoutes: RouteObject[] = [
  // Routes d'authentification sans layout
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/signup-organization", element: <OrganizationSignUp /> },
  { path: "/login", element: <SignIn /> },
  { path: "/register", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // Redirection /auth vers /auth/signin
  { path: "/auth", element: <Navigate to="/auth/signin" replace /> },

  // Routes alternatives avec préfixe auth
  { path: "/auth/signin", element: <SignIn /> },
  { path: "/auth/login", element: <SignIn /> },
  { path: "/auth/signup", element: <SignUp /> },
  { path: "/auth/signup-organization", element: <OrganizationSignUp /> },
  { path: "/auth/register", element: <SignUp /> },
  { path: "/auth/forgot-password", element: <ForgotPassword /> },
];