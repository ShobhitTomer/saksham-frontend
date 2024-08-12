import { createBrowserRouter} from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";

const router = createBrowserRouter([
    {
      path: 'dashboard',
      element: <DashboardLayout/>,
      children: [
        {
          path: '',
          element: <HomePage/>
        }
      ]
    },
    {
      path: '/auth',
      element: <AuthLayout/>,
      children: [
        {
          path: 'user',
          element: <LoginUser/>,
        },
        {
          path: 'admin',
          element: <LoginAdmin/>,
        }
      ]
    }
]);

export default router;