import React from "react"
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
const PostCard = () => {
    return(
        <>
      <div className="flex lg:flex-row flex-col bg-background-light dark:bg-background-dark shadow-md lg:w-full max-w-5xl lg:h-80 lg:p-2  space-x-5">
        <div className=" h-full  overflow-hidden">
            <img className="w-full h-full object-cover" src="du2h5nss2bvulnrht9od.jpg" alt="post" />
        </div>

        <div className="flex flex-col p-2  space-y-3">

            <div className="flex flex-col">
            <span className="font-zilla font-semibold text-4xl dark:text-text-white text-text-charcoal">The Weeknd</span>
            <span className="font-golos text-text-lavenderGray">@Abel Makkonen</span>
            </div>

            <div className="max-w-xl">
                <span className="font-golos text-text-darkGray">The Weekend—a modern classic that resonates beyond the ordinary. Let the music speak to the complexities of love, time, and emotion</span>
            </div>


              <div className="flex flex-row items-center justify-between mr-6">
              <div className="flex flex-row  items-center  space-x-3">
                <div className="flex flex-col">
              <FaRegHeart className="dark:text-text-white text-text-charcoal text-2xl cursor-pointer"/>
              <span className="font-golos dark:text-text-white text-text-charcoal">1.5k</span>
                </div>

                <div className="flex flex-col">
             <FaRegComment className="dark:text-text-white text-text-charcoal text-2xl cursor-pointer"/>
             <span className="font-golos dark:text-text-white text-text-charcoal">1.3k</span>
                </div>

                <div className="flex flex-col">
              <IoIosShareAlt className=" dark:text-text-white text-text-charcoal text-2xl cursor-pointer"/>
              <span className="font-golos dark:text-text-white text-text-charcoal">986</span>
                </div>
            </div>

            <div className="flex flex-col">
            <IoBookmarkOutline className="dark:text-text-white text-text-charcoal text-2xl cursor-pointer"/>
            </div>
           </div>

           
           <div className="flex flex-row ml-auto space-x-2 justify-center items-center mr-6">
              <div className="w-7 h-7 overflow-hidden rounded-full">
                <img className="w-full h-full object-cover cursor-pointer" src="logo.png" alt="" />
              </div>
              <span className="font-golos dark:text-text-white text-text-charcoal cursor-pointer">Abel Makkonen Tesfaye</span>
            </div>
           
        </div>
        </div>   
        </>
    )
}

export default PostCard