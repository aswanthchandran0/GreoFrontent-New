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
import { GetUsersParams } from "../../interface/getUsersParams";


export interface AuthResponse {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    profileImage?: string;
    bio?: string;
    gender?: string;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    postCount: number;
    createdAt: string;
    updatedAt?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface SignupResponse {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    profileImage?: string;
    bio?: string;
    gender?: string;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    postCount: number;
    createdAt: string;
  };
  otpSent: boolean;
}



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
        const { accessToken, refreshToken: freshToken } = response.data;
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



export const signUpApi = async (userData: { name: string; email: string; password: string }) => {
  const response = await API.post<SignupResponse>("/auth/sign-up", userData);
  return response;
};

export const SigninApi = async (email: string, password: string) => {
  const response = await API.post<AuthResponse>("/auth/sign-in", { email, password });
  return response;
};

export const GoogleSignUpApi = async (token: string) => {
  const response = await API.post<AuthResponse>("/auth/sign-up-with-google", { token });
  return response;
};

export const GoogleSignInApi = async (token: string) => {
  const response = await API.post<AuthResponse>("/auth/sign-in-with-google", { token });
  return response;
};

export const verifyOtpApi = async (userId: string, code: string) => {
  const response = await API.post<AuthResponse>("/auth/verify-otp", { userId, code });
  return response;
};






export const forgotPasswordTokenGenerateAPI = async (email: string) => {
  return await API.post("/auth/generate-forgot-password-token", { email });
}

export const updatePasswordApi = async (token:string,password:string) => {
  return await API.patch('/auth/update-password', { token, password })
}

export const resentOtpApi = async (email:string) => {
return await API.post('/auth/resent-otp', { email })
}

export const profileDetailsFetchApi = async (username: string) => {
  try {
    const response = await API.get(`/user/${username}`);
    console.log('Profile API response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export const updateProfileApi = async (data: {
  name?: string;
  username?: string;
  bio?: string;
  gender?: string;
  profileImage?: string;
}) => {
  try {
    const response = await API.patch('/user/profile', data);
    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const checkUsernameApi = async (username:string)=>{
 return await API.get(`/user/check-username/${username}`)
}

export const followUserApi = async (followerId: string, followeeId: string) => {
  return await API.post('/user/follow', { followerId, followeeId })
}

export const unfollowUserApi = async (followerId: string, followeeId: string) => {
  return await API.post('/user/unfollow', { followerId, followeeId })
}


// Change from FormData to JSON payload
export const postUploadApi = async (payload: {
  mediaUrls: string[];
  userId: string;
  content?: string;
}) => {
  return await API.post('/post', payload);
}


export const getUserFeedApi = async (skip:number,limit:number) => {

  return await API.get(`/post/user-feed/${skip}/${limit}`)
}


export const toggleLikeApi = async (targetId:string,targetType:string,)=>{
  console.log("targetid",targetId)
  return await API.post('/post/like',{targetId,targetType})
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

export const createReelApi = async (payload: {
  mediaUrl: string;
  thumbnail: string;
  content?: string;
}) => {
  console.log('data in reel upload', payload);
  return await API.post('/reel', payload);
}

export const getUserPostApi = async(userId:string)=>{
  return await API.get(`/post/${userId}`)
}


export const getUserRollApi = async(userId:string)=>{
  return await API.get(`/reel/${userId}`)
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


export interface CreatePostRequest {
  userId: string; // Required, not optional
  mediaUrls: string[];
  content?: string;
}

export const createPostApi = async (postData: CreatePostRequest) => {
  try {
    const response = await API.post('/post', postData);
    return response;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const deletePostApi = async (postId: string) => {
  const response = await API.delete(`/post/${postId}`);
  return response;
};

export const updatePostApi = async (postId: string, content: string) => {
  const response = await API.patch('/post', { postId, content });
  return response;
};


export const searchUsersApi = async (query: string) => {
  try {
    // Use the new users endpoint with search parameter
    const response = await API.get('/user', { 
      params: { 
        search: query,
        limit: 10,
        page: 1,
        sortBy: "recent",
        filterBy: "all"
      } 
    });
    
    // Return the users from the response
    return {
      data: response.data.data.users
    };
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

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


export const deleteSavedItemApi = async(itemId:string,type:string)=>{
  return await API.delete(`/saveItem?itemId=${itemId}&itemType=${type}`)
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


export const getUsers = async (params:GetUsersParams) => {
  return await API.get('/user', { params });
};

export const getUserProfiles = async (page: number, limit: number) => {
  return await getUsers({ page, limit, sortBy: "recent", filterBy: "all" });
};


// Get single user profile by username
export const getUserProfileByUsername = async (username: string) => {
  return await API.get(`/user/${username}`);
};




export const getSavedItemApi = async () => {
  try {
    const response = await API.get('/saveItem');
    return response;
  } catch (error) {
    console.error("Error getting saved items:", error);
    throw error;
  }
};

// Update toggleSaveApi to use the correct endpoints

export const toggleSaveApi = async (targetId: string, targetType: string, currentIsSaved: boolean) => {
  try {
    // Normalize the item type to uppercase
    const itemType = targetType === 'reel' ? 'REEL' : 'POST';
    
    if (currentIsSaved) {
      // Unsave the item
      const response = await unsaveItemApi(targetId, itemType);
      return { data: { saved: false } };
    } else {
      // Save the item
      const response = await saveItemApi(targetId, itemType);
      return { data: { saved: true } };
    }
  } catch (error) {
    console.error("Error toggling save:", error);
    throw error;
  }
};

// Also update saveItemApi and unsaveItemApi to accept the correct type
export const saveItemApi = async (itemId: string, itemType: 'POST' | 'REEL') => {
  try {
    const response = await API.post('/saveItem/', { 
      itemId, 
      itemType 
    });
    return response;
  } catch (error) {
    console.error("Error saving item:", error);
    throw error;
  }
};

export const unsaveItemApi = async (itemId: string, itemType: 'POST' | 'REEL') => {
  try {
    const response = await API.delete(`/saveItem/?itemId=${itemId}&itemType=${itemType}`);
    return response;
  } catch (error) {
    console.error("Error unsaving item:", error);
    throw error;
  }
};

// Get post details
export const getPostDetailsApi = async (postId: string) => {
  const response = await API.get(`/post/${postId}`);
  return response;
};


export const getCommentsApi = async (targetId: string, targetType: string) => {
  const response = await API.get(`/comment/${targetId}/${targetType}`);
  return response;
};

export const postCommentApi = async (
  targetId: string, 
  targetType: string, 
  content: string,
  parentCommentId?: string
) => {
  const response = await API.post('/comment', {
    targetId,
    targetType,
    content,
    parentCommentId
  });
  return response;
};

export const deleteCommentApi = async (
  commentId: string,
  targetId: string,
  targetType: string
) => {
  const response = await API.delete(`/comment/${commentId}/${targetId}/${targetType}`);
  return response;
};

export const likeCommentApi = async (commentId: string, targetId: string, targetType: string) => {
  const response = await API.post(`/comment/${commentId}/${targetId}/${targetType}/like`);
  return response;
};

export const unlikeCommentApi = async (commentId: string, targetId: string, targetType: string) => {
  const response = await API.delete(`/comment/${commentId}/${targetId}/${targetType}/like`);
  return response;
};

export const editCommentApi = async (
  commentId: string,
  targetId: string,
  targetType: string,
  content: string
) => {
  const response = await API.put(`/comment/${commentId}/${targetId}/${targetType}`, { content });
  return response;
};


// Share post
export const sharePostApi = async (postId: string, shareTo: 'copy' | 'message' | 'story' = 'copy') => {
  const response = await API.post(`/post/${postId}/share`, { shareTo });
  return response;
};

// Get post statistics
export const getPostStatsApi = async (postId: string) => {
  const response = await API.get(`/post/${postId}/stats`);
  return response;
};


export const reportContentApi = async (
  targetId: string,
  targetType: 'POST' | 'REEL',
  reason: string,
  description?: string
) => {
  const response = await API.post('/report', {
    targetId,
    targetType,
    reason,
    description
  });
  return response;
};

export const updateReelApi = async (reelId: string, content: string) => {
  try {
    const response = await API.patch('/reel', { 
      reelId, 
      content 
    });
    return response;
  } catch (error) {
    console.error('Error updating reel:', error);
    throw error;
  }
};

export const deleteReelApi = async (reelId: string) => {
  try {
    const response = await API.delete(`/reel/${reelId}`);
    return response;
  } catch (error) {
    console.error('Error deleting reel:', error);
    throw error;
  }
};

export const getExploreFeedApi = async (page: number = 1, pageSize: number = 20) => {
  try {
    const response = await API.get(`/explore?page=${page}&pageSize=${pageSize}`);
    return response;
  } catch (error) {
    console.error('Error fetching explore feed:', error);
    throw error;
  }
};


export const getAllReelsApi = async (page: number = 1, pageSize: number = 10) => {
  try {
    const response = await API.get(`/reel/feed?page=${page}&pageSize=${pageSize}`);
    return response;
  } catch (error) {
    console.error('Error fetching reels:', error);
    throw error;
  }
};