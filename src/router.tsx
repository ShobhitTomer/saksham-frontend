import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import SignIn from "./pages/SignIn";
import Navbar from "./pages/Navbar";
import AddUser from "./pages/AddUser";
import FirPage from "./pages/FirPage";
import Analysis from "./pages/Analysis";
import SignUp from "./pages/SignUp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/user" />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "fir",
        element: <FirPage />,
      },
      {
        path: "adduser",
        element: <AddUser />,
      },
      {
        path: "analysis",
        element: <Analysis />,
      },
    ],
  },
  {
    path: "Navbar",
    element: <Navbar />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signin",
        element: <SignIn />,
      },

      {
        path: "signup",
        element: <SignUp />,
      },
    ],
  },
  
]);

export default router;
