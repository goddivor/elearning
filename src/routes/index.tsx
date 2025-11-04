import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "../app.layout";
import NewDashboardLayout from "../layouts/NewDashboardLayout";
import NotFound from "../pages/NotFound";

import { authRoutes } from "./auth.routes";
import LandingPage from "@/pages/landing";
import DashboardHome from "@/pages/dashboard/Home";
import Settings from "@/pages/dashboard/Settings";
import BecomeInstructor from "@/pages/BecomeInstructor";
import InstructorApplication from "@/pages/InstructorApplication";
import ApplicationSubmitted from "@/pages/ApplicationSubmitted";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/become-instructor", element: <BecomeInstructor /> },
      { path: "/become-instructor/apply", element: <InstructorApplication /> },
      { path: "/application-submitted", element: <ApplicationSubmitted /> },
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
      { path: "settings", element: <Settings /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;