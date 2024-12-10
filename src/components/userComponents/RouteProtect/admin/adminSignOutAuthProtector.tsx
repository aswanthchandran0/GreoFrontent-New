
import { Navigate,Outlet } from "react-router-dom";
import { tokenService } from "../../../../services/user/tokenService";
function AdminSignOutAuth(){
    const token =  tokenService.getAdminAccessToken()
    return token? <Navigate to={'/admin'}/>:<Outlet/>
}

export default AdminSignOutAuth