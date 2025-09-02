import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import LandingPage from "./landing";
import RootLayout from "../app.layout";
import NotFound from "./NotFound";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import ForgotPassword from "./auth/ForgotPassword";

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
]);

export const AppRouter = () => <RouterProvider router={router} />;
