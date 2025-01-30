import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { tokenService } from "../../../services/user/tokenService";
const ProtectedRoute: React.FC = () => {
  const accessToken = tokenService.getAccessToken();
  if (accessToken) return <Outlet />;
  return <Navigate to="/get-started" />;
};

export default ProtectedRoute;
 