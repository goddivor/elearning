import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "../app.layout";
import NewDashboardLayout from "../layouts/NewDashboardLayout";
import NotFound from "../pages/NotFound";

import { authRoutes } from "./auth.routes";
import LandingPage from "@/pages/landing";
import DashboardHome from "@/pages/dashboard/Home";

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

  // Routes du dashboard unique avec layout
  {
    path: "/dashboard",
    element: <NewDashboardLayout />,
    children: [
      // Page d'accueil du dashboard
      { path: "", element: <DashboardHome /> },

      // Les autres routes seront ajoutées progressivement
      // { path: "my-courses", element: <MyCourses /> },
      // { path: "catalog", element: <Catalog /> },
      // { path: "instructor", element: <InstructorPage /> },
      // { path: "organization", element: <OrganizationPage /> },
      // { path: "profile", element: <Profile /> },
      // { path: "settings", element: <Settings /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;