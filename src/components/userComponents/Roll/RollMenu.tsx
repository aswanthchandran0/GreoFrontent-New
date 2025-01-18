import { on } from "process"
import React from "react"

interface Props{
    onClose:()=>void
}

const  RollMenu:React.FC<Props> = ({onClose})=>{
    return (
        <div onClick={onClose} className="fixed inset-0 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
      <div  className="flex flex-col items-center justify-center w-full bg-opacity-50 h-dvh bg-background-dark ">
      <div
          onClick={(e) => e.stopPropagation()}
          className="flex justify-center items-center flex-col w-full md:max-h-[35rem]  max-w-[25rem] bg-background-light dark:bg-background-customDarkGray rounded"
        >
         its the roll menu
        </div>
        </div>
        </div>
    )
}


export default RollMenu