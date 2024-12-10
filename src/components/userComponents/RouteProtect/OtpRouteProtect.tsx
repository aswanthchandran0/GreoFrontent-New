import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Navigate} from "react-router-dom";
import { ReactNode } from "react";

interface OtpRouteProtectProps {
    children: ReactNode;
  }

const OtpRouteProtect = ({ children }: OtpRouteProtectProps)=>{
   const user = useSelector((state:RootState)=> state.UserReducer.user)
   if (user) {
    return <>{ children }</>;
  }
  return <Navigate to="/auth/signup" />;
}


export default OtpRouteProtect