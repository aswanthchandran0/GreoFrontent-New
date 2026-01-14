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
      return await  API.post('/signin',{email,password})
    }


    
export const getAllUser = async ()=>{
  return await API.get('/users')
}
export const suspendUserApi = async(userId:string|null)=>{
  if(userId !== null){
    return await API.patch(`/users/${userId}/suspend`)
  }else{
   throw new Error('userId not in there')
  }
}


export const unSuspendUserApi = async (userId:string|null)=>{
  if(userId !== null){
    return await API.patch(`/users/${userId}/unsuspend`)
  }else{
   throw new Error('userId not in there')
  }
}

export const getUserDetailsApi = async (username:string)=>{
   return await API.get(`/users/${username}/`)
}

export const getReportedPostApi = async ()=>{
  return await API.get(`/reportedPosts`)
}

export const getStackOfUsersApi = async (userIds:string[])=>{
  return await API.post('/stackOfusers',{userIds})
}


export const getTop10Users = async ()=>{
  return await API.get("/top10Users")
}

export const getAllRollsAndPostsApi = async()=>{
  return await API.get("/rollsAndPosts")
}

export const blockUserPost = async (postId:string,action:boolean)=>{

  return await API.patch("users",{postId,action})

  
}

export const blockPostApi = async (postId: string, reason?: string) => {
  return API.post(`/posts/${postId}/block`, { reason });
};

// Unblock a post  
export const unblockPostApi = async (postId: string) => {
  return API.post(`/posts/${postId}/unblock`);
};