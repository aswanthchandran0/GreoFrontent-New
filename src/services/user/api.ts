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
        navigateTo("/auth/signin");
        return Promise.reject(error);
      }


      try {
        const response = await API.post("/refresh-token", { refreshToken });
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
  return await API.post("/user_signup", userData);
};

export const verifyOtp = async (userId: string, otpCode: string) => {
  console.log(otpCode);
  return await API.post("/verify_otp", { userId, otpCode });
};

export const SigninApi = async (email: string, password: string) => {
  return await API.post("/user_signin", { email, password });
};

export const GoogleSignUpApi = async (token: string) => {
  return await API.post("/signup_with_google", {token,publicKey: "*******",})
}

export const GoogleSignInApi = async (token: string) => {
  return await API.post('/signin_with_google', { token })
}

export const forgotPasswordTokenGenerateAPI = async (email: string) => {
  return await API.post("/generate_forgot_password_token", { email });
}

export const updatePasswordApi = async (token:string,password:string) => {
  return await API.patch('/update_password', { token, password })
}

export const resentOtpApi = async (email:string) => {
return await API.post('/resent_otp', { email })
}

export const profileDetailsFetchApi = async (username:string) => {
  return await API.get(`/profile/${username}`)
}

export const updateProfileApi = async (data:FormData)=>{
  return await API.patch('/update_profile', data)  
}

export const checkUsernameApi = async (username:string)=>{
 return await API.get(`/check_username/${username}`)
}

export const followUserApi = async (followerId: string, followeeId: string) => {
  return await API.post('/follow', { followerId, followeeId })
}

export const unfollowUserApi = async (followerId: string, followeeId: string) => {
  return await API.post('/unfollow', { followerId, followeeId })
}

export const postUploadApi = async (formData: FormData) => {
  return  await API.post('/post_upload', formData)
}

export const getUserFeedApi = async (skip:number,limit:number) => {
  console.log('skip',skip)
  return await API.get(`/user_feed/${skip}/${limit}`)
}



export const likePostApi = async (likeIds: string[], unlikeIds: string[]) => {
  return await API.post('/like_post', { likeIds, unlikeIds });
};



export const getCommentsApi = async (postId: string) => {
  return await API.get(`/get_comments/${postId}`,)
}


export const commentSentAPi = async (postId: string, content: string) => {
  console.log('post id and commment', postId, content)
  return await API.post(`/post_comment`, { postId, content })
}

export const getUserByIdApi = async (userId: string) => {
  return await API.get(`/get_user_by_id/${userId}`)
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
  return await API.get(`/followers/${username}`)
}

export const getFollowingApi = async(username:string)=>{
  return await API.get(`/following/${username}`)
}

export const rollUploadApi  = async(payload:RollUploadPayload)=>{
  console.log('data in roll upload',payload)
  return await API.post('/roll',payload)
}

export const getUserRollApi = async(userId:string)=>{
  return await API.get(`/roll/${userId}`)
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
    const response = await API.get('/latest-roll/', {
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
  return await API.post('/report-post',{postId,reason})
}

export const searchUsersApi = async(query:string)=>{
  return await API.get(`/users/${query}`)
}

export const getLikedUsersApi = async (postId:string)=>{
  return await API.get(`/likedUsers/${postId}`)
}

export const getExploreDataApi = async(page:number,pageSize:number)=>{
  return await API.get(`explore/${page}/${pageSize}`)
}

export const getSingePostApi = async(postId:string)=>{
  console.log('geti single post api was calling')
  return await API.get(`post/${postId}`)

}

export const saveItemApi = async(item:SavedItemArrayElement)=>{
  return await API.post('/saveItem',item)
}

export const deleteSavedItemApi = async(itemId:string,type:string)=>{
  return await API.delete(`/saveItem?itemId=${itemId}&type=${type}`)
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