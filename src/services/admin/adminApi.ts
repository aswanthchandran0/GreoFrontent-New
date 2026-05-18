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



export const adminSigninApi = async (email: string, password: string) => {
    console.log("Admin signin request...");
    const response = await API.post('/signin', { email, password });
    console.log('Admin signin response:', response.data);
    return response;
}

    
export const getAllUser = async ()=>{
  return await API.get('/users')
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

///////////////////////////////////////////////////////////// new code /////////////////////////////////////////////////////////////////////////

// ✅ NEW: Dashboard Stats API
export const getDashboardStats = async () => {
    return await API.get('/dashboard/stats')
}

export const getUserManagementData = async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    filter: 'all' | 'suspended' | 'flagged' = 'all'
) => {
    // Build query parameters
    const params: any = {
        page,
        limit
    };
    
    if (search && search.trim()) {
        params.search = search.trim();
    }
    
    if (filter && filter !== 'all') {
        params.filter = filter;
    }
    
    return await API.get('/users', { params });
}

// ✅ Suspend user API
export const suspendUserApi = async (userId: string, reason: string) => {
    return await API.patch(`/users/${userId}/suspend`, { reason });
}

// ✅ Unsuspend/Activate user API
export const unSuspendUserApi = async (userId: string) => {
    return await API.patch(`/users/${userId}/unsuspend`);
}

// ✅ Warn user API
export const warnUserApi = async (userId: string, reason: string) => {
    return await API.post(`/users/${userId}/warn`, { reason });
}


// Posts API
export const getAdminPosts = async (params: {
  page: number;
  limit: number;
  search?: string;
  filterBy?: string;
  sortBy?: string;
}) => {
  const result = await API.get('/content/posts', { params });
  console.log("admin post result ----------------------------",result)
  return result
};

export const blockPost = async (postId: string, reason?: string) => {
  return await API.patch(`/content/posts/${postId}/block`, { reason });
};

export const unblockPost = async (postId: string) => {
  return await API.patch(`/content/posts/${postId}/unblock`);
};

export const deletePost = async (postId: string, reason?: string) => {
  return await API.delete(`/content/posts/${postId}`, { data: { reason } });
};

// Reels API
export const getAdminReels = async (params: {
  page: number;
  limit: number;
  search?: string;
  filterBy?: string;
  sortBy?: string;
}) => {
  const result =  await API.get('/content/reels', { params });
  console.log('admin reels response --------------------------',result)
  return result
};

export const blockReel = async (reelId: string, reason?: string) => {
  return await API.patch(`/content/reels/${reelId}/block`, { reason });
};

export const unblockReel = async (reelId: string) => {
  return await API.patch(`/content/reels/${reelId}/unblock`);
};

export const deleteReel = async (reelId: string, reason?: string) => {
  return await API.delete(`/content/reels/${reelId}`, { data: { reason } });
};

// Comments API
export const getAdminComments = async (params: {
  page: number;
  limit: number;
  search?: string;
  filterBy?: string;
}) => {
  const result =  await API.get('/content/comments', { params });
  console.log('result of the admin comments---------------',result)
  return result
};

export const deleteComment = async (commentId: string, targetId: string, targetType: string, reason?: string) => {
  return await API.delete(`/content/comments/${commentId}/${targetId}/${targetType}`, { data: { reason } });
};