// RollLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const RollLayout = () => {
  const isDarkMode = useSelector((state: RootState) => state.preferences.darkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="fixed inset-0 bg-black">
      <Outlet />
    </div>
  );
};

export default RollLayout;