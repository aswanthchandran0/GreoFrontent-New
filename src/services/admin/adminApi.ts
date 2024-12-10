import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenService } from "../user/tokenService";
import { navigateTo } from "../../utils/navigate";


const API =  axios.create({
    baseURL: import.meta.env.VITE_ADMIN_BASE_URL
})


API.interceptors.request.use(
    (config:InternalAxiosRequestConfig) =>{
        const token = tokenService.getAdminAccessToken()
        if(token) config.headers.Authorization = `Bearer ${token}`;
        return config
    },
    (error: AxiosError) => Promise.reject(error)
)

API.interceptors.response.use(
    (response) => response,
    async (error:AxiosError)=>{
      if(error.response && error.response.status === 401){
        console.error('Admin token expired or unauthorized access. Redirecting.... ')
        navigateTo('/admin/auth')
      }
    }
    )



 export  const adminSigninApi = async (email:string,password:string)=>{
      return await  API.post('/authenticate',{email,password})
    }


    
export const getAllUser = async ()=>{
  return await API.get('/users')
}
export const suspendUserApi = async(userId:string|null)=>{
  if(userId !== null){
    return await API.post('/users/suspend',{userId})
  }else{
   throw new Error('userId not in there')
  }
}


export const unSuspendUserApi = async (userId:string|null)=>{
  if(userId !== null){
    return await API.post('/users/unsuspend',{userId})
  }else{
   throw new Error('userId not in there')
  }
}

export const getUserDetailsApi = async (userId:string)=>{
   return await API.get(`/userDetails/${userId}/`)
}