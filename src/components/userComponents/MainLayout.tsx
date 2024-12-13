import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { setNavigateFunction } from "../../utils/navigate";
import { useEffect } from "react";
import { useCall } from "../../context/CallContext";
import IncomingCallModal from "./VideoCall/IncomingCallModal";

const MainLayout = () => {
  const navigate = useNavigate(); // This is inside the router context
   const {incomingCall} = useCall()
   
  useEffect(() => {
    setNavigateFunction(navigate); // Set the navigate function globally if necessary
  }, [navigate]);
  return (
    <>
      <div className="relative w-screen h-screen bg-background-light dark:bg-background-dark">

        {
          incomingCall && <IncomingCallModal/>
        //  <IncomingCallModal/>
        }
        <NavBar />
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
