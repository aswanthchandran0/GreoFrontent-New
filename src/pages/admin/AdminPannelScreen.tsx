// AdminPanel.jsx
import { Navigate, Outlet } from "react-router-dom";       // Ensure the path is correct
import Sidebar from "../../components/adminComponents/auth/Sidebar";
import { tokenService } from "../../services/user/tokenService";

const AdminPanel: React.FC = () => {
         const token = tokenService.getAdminAccessToken()
         if(!token){
        return  <Navigate to={'/admin/auth'} />
         }    
    return (
        <div className="bg-background-light w-full h-screen flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-grow p-4 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminPanel;
