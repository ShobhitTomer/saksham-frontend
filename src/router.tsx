import { createBrowserRouter} from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import DashboardLayout from "./layouts/DashboardLayout";

const router = createBrowserRouter([
    {
      path: 'dashboard',
      element: <DashboardLayout/>,
      children: [
        {
          path: 'home',
          element: <HomePage/>
        }
      ]
    },
    {
      path: '/login',
      element: <LoginPage/>,
    },
]);

export default router;