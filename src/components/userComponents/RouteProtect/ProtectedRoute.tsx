import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { tokenService } from "../../../services/user/tokenService";
const ProtectedRoute: React.FC = () => {
  const accessToken = tokenService.getAccessToken();
  const user = useSelector((state: RootState) => state.UserReducer.user);
  if (accessToken) return <Outlet />;
  if (!accessToken && user) return <Navigate to="/auth/otpverify" />;
  return <Navigate to="/auth/signIn" />;
};

export default ProtectedRoute;
 