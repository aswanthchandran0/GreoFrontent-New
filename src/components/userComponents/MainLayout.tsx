import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"

 
 const MainLayout = ()=>{
    return(
        <>
        <div className="w-screen h-screen bg-background-light dark:bg-background-dark">
            <NavBar/>
            <Outlet/>
        </div>
        </>
    )
 }



 export default  MainLayout