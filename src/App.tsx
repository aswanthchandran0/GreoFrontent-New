// App.jsx  
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
import ChatScreen from "./pages/ChatScreen";
import OtpVerification from "./components/userComponents/Authenticate/OtpVerification";
import ProtectedRoute from "./components/userComponents/RouteProtect/ProtectedRoute";
import AuthRoute from "./components/userComponents/RouteProtect/AuthRoute";
import OtpRouteProtect from "./components/userComponents/RouteProtect/OtpRouteProtect";
import ForgotPassword from "./components/userComponents/Authenticate/ForgotPassword";
import ResetPassword from "./components/userComponents/Authenticate/ResetPassword";
import EditProfile from "./components/userComponents/profile/EditProfile";
import AdminAuth from "./pages/admin/AdminAuth";
import Auth from "./components/adminComponents/auth/Auth";
import AdminSignOutAuth from "./components/userComponents/RouteProtect/admin/adminSignOutAuthProtector";
import Chat from "./components/userComponents/Chat/Chat";
import ExploreScreen from "./pages/ExploreScreen";
import ShareScreen from "./pages/ShareScreen";
import ProfilesScreen from "./pages/ProfilesScreen";
import LandingPage from "./pages/LandingPage";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { tokenService } from "./services/user/tokenService";
import { SocketProvider } from "./context/SocketContext";
import { CallProvider } from "./context/CallContext";
import CallManager from "./components/userComponents/call/CallManager";
import ReelScreen from "./pages/ReelScreen";

// NEW ADMIN PANEL IMPORTS
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";


const router = createBrowserRouter([
  {
    path:'/get-started',
    element: <AuthRoute />,
    children:[
      {
        index:true,
        element:<LandingPage/>
      }
    ]
  },
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
            path: "explore",
            element:<ExploreScreen/>
          },
          {
            path:"p/:postId",
            element:<ShareScreen/>
          },
          {
            path:"profiles",
            element:<ProfilesScreen/>
          }
        ],
      },
      // Roll route should be outside MainLayout but still inside ProtectedRoute
      {
        path: "roll",
        element: (
          <div className="fixed inset-0 bg-black">
            <ReelScreen />
          </div>
        ),
      },
    ],
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
  // Admin Auth Route (Login)
  {
    path:'/admin/auth',
    element:<AdminSignOutAuth/>,
    children:[
      {
        element:<AdminAuth/>,
        children: [
          {
            index:true,
            element: <Auth/> 
          }
        ]
      }
    ]
  },
  // NEW ADMIN PANEL ROUTES (Replacing the old admin panel)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "content",
        element: <AdminContent />,
      },
      {
        path: "reports",
        // element: <AdminReports />,
      },
      {
        path: "activity",
        // element: <AdminActivityLog />,
      },
      {
        path: "settings",
        // element: <AdminSettings />,
      },
      {
        path: "announce",
        // element: <AdminAnnounce />,
      },
      {
        path: "profile",
        // element: <AdminProfile />,
      },
    ],
  },
  {
    path:"demo",
    element: <Navigate to="/" />
  }
]);

const App = () => { 
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const token = tokenService.getAccessToken();
 
  if (user && token) {
    return (
      <SocketProvider userId={user.id} token={token}>
        <CallProvider>
          <Toaster position="top-right" />
          <RouterProvider router={router} />
          <CallManager />
        </CallProvider>
      </SocketProvider>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;