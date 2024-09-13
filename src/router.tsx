import { createBrowserRouter, Navigate} from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";
import Navbar from "./pages/Navbar";
import AddUser from "./pages/AddUser";
import FirPage from "./pages/FirPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/user" /> 
  },
    {
      path: '/dashboard',
      element: <DashboardLayout/>,
      children: [
        {
          path: '',
          element: <HomePage/>
        },
        {
          path:'fir',
          element:<FirPage/>

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