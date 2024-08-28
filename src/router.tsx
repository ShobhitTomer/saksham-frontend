import { createBrowserRouter} from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";
import Navbar from "./pages/Navbar";
import AddUser from "./pages/AddUser";

const router = createBrowserRouter([
    {
      path: '/dashboard',
      element: <DashboardLayout/>,
      children: [
        {
          path: 'home',
          element: <HomePage/>
        },
        {
          path: 'adduser',
          element: <AddUser/>
        }
      ]
    },
    {
      path: 'Navbar',
      element: <Navbar/>
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