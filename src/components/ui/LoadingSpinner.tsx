import React from "react"
import { ClipLoader } from 'react-spinners';

interface LoaderSpinnerProps{
    loading?:boolean
    color?:string
    size?:number
}

export const LoaderSpinner:React.FC<LoaderSpinnerProps> = ({loading,color='#3B82F6',size = 50 })=>{
    return (
        <>
        {
            loading && (
             <div className="absolute items-center justify-center w-screen h-screen bg-opacity-50 bg-background-dark">
                <ClipLoader color={color} loading={loading} size={size}/>
             </div>   
            )
        }
        </>
    )
}