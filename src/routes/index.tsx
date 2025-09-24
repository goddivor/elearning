import { createBrowserRouter, RouterProvider } from "react-router";
import LandingPage from "../pages/landing";
import RootLayout from "../app.layout";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleBasedRedirect from "../components/RoleBasedRedirect";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/NotFound";
import Profile from "../pages/Profile";

import { authRoutes } from "./auth.routes";
import { adminRoutes } from "./admin.routes";
import { instructorRoutes } from "./instructor.routes";
import { studentRoutes } from "./student.routes";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },

  // Routes d'authentification
  ...authRoutes,

  // Routes du dashboard avec layout
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      // Redirection selon le rôle utilisateur
      { path: "", element: <RoleBasedRedirect /> },

      // Routes admin
      ...adminRoutes,

      // Routes instructor
      ...instructorRoutes,

      // Routes student
      ...studentRoutes,

      // Route profile accessible à tous les utilisateurs authentifiés
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;