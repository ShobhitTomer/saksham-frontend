import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import SignIn from "./pages/SignIn";
import Navbar from "./pages/Navbar";
import FirPage from "./pages/FirPage";
import Analysis from "./pages/Analysis";
import SignUp from "./pages/SignUp";
import AllUsers from "./pages/AllUsers";
import AddUser from "./pages/AddUser";
import DeleteUser from "./pages/DeleteUser";
import HeatmapAnalysis from "./pages/HeatmapAnalysis";
import ChatBot from "./pages/ChatBot";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/signin" />,
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
        path: "heatmap",
        element: <HeatmapAnalysis />,
      },
      {
        path: "fir",
        element: <FirPage />,
      },
      {
        path: "chatbot",
        element: <ChatBot />,
      },
      {
        path: "users",
        element: <AllUsers />,
        children: [
          {
            path: "adduser",
            element: <AddUser />,
          },
          {
            path: "deleteuser",
            element: <DeleteUser />,
          },
        ],
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
