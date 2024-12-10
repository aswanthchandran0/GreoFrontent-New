import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { setNavigateFunction } from "../../utils/navigate";
import { useEffect } from "react";

const MainLayout = () => {
  const navigate = useNavigate(); // This is inside the router context

  useEffect(() => {
    setNavigateFunction(navigate); // Set the navigate function globally if necessary
  }, [navigate]);
  return (
    <>
      <div className="w-screen h-screen bg-background-light dark:bg-background-dark">
        <NavBar />
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
