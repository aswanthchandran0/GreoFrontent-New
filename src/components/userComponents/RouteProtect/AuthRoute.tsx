import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenService } from "../../../services/user/tokenService";

const AuthRoute: React.FC = () => {
  const accessToken = tokenService.getAccessToken();
  if (accessToken){
   console.log("accesstoken detected in auth route-------------",accessToken) 
   return <Navigate to="/" />;
  }
  return <Outlet />;
};

export default AuthRoute;
