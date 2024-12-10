// App.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import HomeScreen from "./pages/HomeScreen";
import MainLayout from "./components/userComponents/MainLayout";
import UserAuth from "./pages/UserAuth";
import Signin from "./components/userComponents/Authenticate/Signin";
import Signup from "./components/userComponents/Authenticate/Signup";
import ProfileScreen from "./pages/ProfileScreen";
import RollScreen from "./pages/RollScreen";
import ChatScreen from "./pages/ChatScreen";
import OtpVerification from "./components/userComponents/Authenticate/OtpVerification";
import ProtectedRoute from "./components/userComponents/RouteProtect/ProtectedRoute";
import AuthRoute from "./components/userComponents/RouteProtect/AuthRoute";
import OtpRouteProtect from "./components/userComponents/RouteProtect/OtpRouteProtect";
import ForgotPassword from "./components/userComponents/Authenticate/ForgotPassword";
import ResetPassword from "./components/userComponents/Authenticate/ResetPassword";
import EditProfile from "./components/userComponents/profile/EditProfile";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminPannelScreen from "./pages/admin/AdminPannelScreen";
import Auth from "./components/adminComponents/auth/Auth";
import AdminSigninAuthProtector from "./components/userComponents/RouteProtect/admin/adminSignInAuthProtector";
import AdminSignOutAuth from "./components/userComponents/RouteProtect/admin/adminSignOutAuthProtector";
import Users from "./components/adminComponents/userManagement/Users";
import UserDetails from "./components/adminComponents/userManagement/UserDetails";
import Chat from "./components/userComponents/Chat/Chat";
import VideoCall from "./components/userComponents/VideoCall/VideoCall";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomeScreen />,
          },
          {
            path: "chat",
            element: <ChatScreen />,
            children:[
              {
                path:":userId",
                element:<Chat/>
              }
            ]
          },
          {
            path: "profile/:username",
            element: <ProfileScreen />,
            children: [
              {
                path: "edit",
                element: <EditProfile />,
              },
            ],
          },
          {
            path: "notification",
          },
          {
            path: "roll",
            element: <RollScreen />,
          },
          {
            path: "explore",
          },
        ],
      },
    ],
  },
  {
    path:"/call/:userId",
    element:<VideoCall/>
  },
  {
    path: "/auth",
    element: <AuthRoute />,
    children: [
      {
        element: <UserAuth />,
        children: [
          {
            index: true,
            element: <Navigate to="signIn" />,
          },
          {
            path: "signIn",
            element: <Signin />,
          },
          {
            path: "signUp",
            element: <Signup />,
          },
          {
            path: "forgotpassword",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password/:token",
            element: <ResetPassword />,
          },
          {
            path: "otpverify",
            element: (
              <OtpRouteProtect>
                <OtpVerification />
              </OtpRouteProtect>
            ),
          },
        ],
      },
    ],
  },
  {
    path:'/admin/auth',
    element:<AdminSignOutAuth/>,
    children:[
    {
      element:<AdminAuth/>,
      children: [
        {
          index:true,
          element: <Auth/> }
      ]
    }
    ]
     
  },
  {
    path:'/admin',
    element:<AdminPannelScreen/>,
    children:[
      {
         path:"users",
        element:<Users/>,
      },
    ]

  }
]);

const App = () => { 
  return (
  <>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </>
)
};

export default App;
