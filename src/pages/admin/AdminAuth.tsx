import { Player } from "@lottiefiles/react-lottie-player"
import { Outlet } from "react-router-dom"
import lottieLinks from "../../assets/lottieFiles/lottieLinks"

const AdminAuth = ()=>{
    return(
        <>
        <div className="flex flex-row items-center justify-center w-screen h-dvh bg-background-charcoal ">
  
        <span className="absolute hidden text-2xl font-bold cursor-pointer top-3 left-3 lg:flex md:text-3xl font-outfit text-text-white">
              Greo
            </span>
          <div className="flex items-center justify-center flex-1 w-full h-full">
              <Outlet/>
          </div>
  
          <div className="items-center justify-center flex-1 hidden lg:flex">
            <Player
              autoplay
              loop
              src={lottieLinks.animation_socialMedia}
              className="w-[37rem] h-[37rem]"
            />
          </div>
        </div>
      </>
    )
}

export default AdminAuth
