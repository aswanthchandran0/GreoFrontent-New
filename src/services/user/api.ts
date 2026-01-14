import axios from "axios";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenService } from "./tokenService";
import { navigateTo } from "../../utils/navigate";
import { logOut } from "../../redux/slices/userSlice";
import { store } from "../../redux/store";
import { RollUploadPayload } from "../../components/userComponents/profile/RollUpload";
import { ReportReasonType } from "../../Types/postTypes";
import { SavedItemArrayElement } from "../../Types/savedItemTypes";
import { CreateChatRequest } from "../../Types/userChats/createChatApiType";
const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});



API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if(error.response?.status ===403  && !originalRequest._retry){
      tokenService.clearToken()
      store.dispatch(logOut())
    
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken ) {
        console.log('refresh token not found');
        store.dispatch(logOut());
        navigateTo("/get-started");
        return Promise.reject(error);
      }


      try {
        const response = await API.post("/auth/refresh", { refreshToken });
        console.log('after refresh token retrive',response.data);
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenService.setToken(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (error) {
        tokenService.clearToken();
        
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const signUpApi = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  console.log("request was reaching in this api and its auth si")
  return await API.post("/auth/sign-up", userData);
};

export const verifyOtp = async (userId: string, code: string) => {

  return await API.post("/auth/verify-otp", { userId, code  });
};

export const SigninApi = async (email: string, password: string) => {
  return await API.post("/auth/sign-in", { email, password });
};

export const GoogleSignUpApi = async (token: string) => {
  return await API.post("/auth/sign-up-with-google", {token})
}

export const GoogleSignInApi = async (token: string) => {
  return await API.post('/auth/sign-in-with-google', { token })
}

export const forgotPasswordTokenGenerateAPI = async (email: string) => {
  return await API.post("/auth/generate-forgot-password-token", { email });
}

export const updatePasswordApi = async (token:string,password:string) => {
  return await API.patch('/auth/update-password', { token, password })
}

export const resentOtpApi = async (email:string) => {
return await API.post('/auth/resent-otp', { email })
}

export const profileDetailsFetchApi = async (username:string) => {
  const result =  await API.get(`/profile/${username}`)
  console.log("profiel result",result)
  return result
}

export const updateProfileApi = async (data:FormData)=>{
  return await API.patch('/profile/update', data)  
}

export const checkUsernameApi = async (username:string)=>{
 return await API.get(`/profile/check-username/${username}`)
}

export const followUserApi = async (followerId: string, followeeId: string) => {
  return await API.post('/profile/follow', { followerId, followeeId })
}

export const unfollowUserApi = async (followerId: string, followeeId: string) => {
  return await API.post('/profile/unfollow', { followerId, followeeId })
}

export const postUploadApi = async (formData: FormData) => {
  return  await API.post('/post', formData)
}

export const getUserFeedApi = async (skip:number,limit:number) => {

  return await API.get(`/post/user-feed/${skip}/${limit}`)
}


export const toggleLikeApi = async (targetId:string,targetType:string,)=>{
  console.log("targetid",targetId)
  return await API.post('/post/like',{targetId,targetType})
}








export const getCommentsApi = async (targetId:string,targetType = 'post') => {
  return await API.get(`/post/comments/${targetId}/${targetType}`,)
}

export const postCommentApi = async(targetId:string,targetType:string,content:string) =>{
  return await API.post('/post/post-comment',{targetId,targetType,content})
}



export const getUserByIdApi = async (userId: string) => {
  return await API.get(`/profile/user-by-id/${userId}`)
}

export const getChatsApi = async (userId: string) => {
  return await API.get(`/chat/${userId}`)
}

export const getMessagesApi = async (userId: string) => {
  return await API.get(`/chat/m/${userId}`)
}

export const addMessageApi = async (messageData: object) => {
  return await API.post(`/chat/m`, messageData)
}

export const createChatApi = async(data:CreateChatRequest)=>{
  return await API.post('/chat',data)
}

export const getFollowersApi = async(username:string)=>{
  return await API.get(`/profile/followers/${username}`)
}

export const getFollowingApi = async(username:string)=>{
  return await API.get(`/profile/following/${username}`)
}

export const rollUploadApi  = async(payload:RollUploadPayload)=>{
  console.log('data in roll upload',payload)
  return await API.post('/reel',payload)
}

export const getUserPostApi = async(userId:string)=>{
  return await API.get(`/post/${userId}`)
}


export const getUserRollApi = async(userId:string)=>{
  return await API.get(`/reel/${userId}`)
}



export const likeRollApi = async (likeIds: string[], unlikeIds: string[]) => {
  return await API.post('/roll_like_post', { likeIds, unlikeIds });
};



export const rollGetCommentsApi = async (rollId: string) => {
  return await API.get(`/roll_get_comments/${rollId}`,)
}


export const rollCommentSentAPi = async (rollId: string, content: string) => {
  console.log('post id and commment', rollId, content)
  return await API.post(`/roll_post_comment`, { rollId, content })
}

export const latestRollApi = async (page:number,pageSize:number,)=>{
  try {
    const response = await API.get('/reel/feed/', {
      params: { page, pageSize }, // Pass pagination params
    });
    return response;
  } catch (error) {
    console.error('Error fetching latest rolls:', error);
    throw error;
  }
}


export const deletePostApi = async(postId:string)=>{
  return await API.delete(`/post/${postId}`)
}

export const updatePostApi = async (postId:string,content:string)=>{
  return await API.patch(`/post`,{content,postId})
}

export const reportPostApi  =async(postId:string,reason:ReportReasonType)=>{
  return await API.post('/post/report',{postId,reason})
}

export const searchUsersApi = async(query:string)=>{
  return await API.get(`/profile/users`,{ params: { query }})
}

export const getLikedUsersApi = async (postId:string)=>{
  return await API.get(`/likedUsers/${postId}`)
}

export const getExploreDataApi = async(page:number,pageSize:number)=>{
  return await API.get(`explore/`,{params:{page,pageSize}})
}

export const getSingePostApi = async(postId:string)=>{
  console.log('geti single post api was calling')
  return await API.get(`post/${postId}`)

}

export const saveItemApi = async(item:SavedItemArrayElement)=>{
  console.log("saved item in saved api -----------------",item)
  return await API.post('/saveItem/',item)
}

export const deleteSavedItemApi = async(itemId:string,type:string)=>{
  return await API.delete(`/saveItem?itemId=${itemId}&itemType=${type}`)
}

export const getSavedItemApi = async()=>{
  return await API.get('/saveItem')
}

export const saveNotification = async(userId:string,entityId:string,mediaUrl:string,message:string,type:string)=>{
   return await API.post("/notification",{userId,entityId,mediaUrl,message,type})
}

export const deleteNotification = async(entityId:string,userId:string,type:string)=>{
  return await API.delete("/notification",{data: { entityId, userId,type },})
}

export const getUserNotificationApi = async()=>{
  return await API.get("/notification")
}

export const NotificationUpdatingApi = async()=>{
  return await API.patch("/notification")
}

export const deleteRollApi = async(rollId:string)=>{
  return await API.delete(`/roll/${rollId}`)
}


export const  getUserProfiles = async(page:number,limit:number)=>{
  return await API.get(`/profiles/${page}/${limit}`)
}
