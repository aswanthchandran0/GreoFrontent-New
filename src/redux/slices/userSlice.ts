// src/redux/slices/userSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { tokenService } from "../../services/user/tokenService";
import { GoogleSignInApi, GoogleSignUpApi, SigninApi, signUpApi } from "../../services/user/api";
import toast from "react-hot-toast";

// User interface matching backend response
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  gender?: "male" | "female" | "other" | "prefer not to say";
  isVerified: boolean;
  isSuspended: boolean;
  followersCount: number;
  followingCount: number;
  postCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  socketId?: string;
  // Optional fields that might come from other contexts
  isFollowing?: boolean; // For profile view context
  otherUser?: boolean; // For profile view context
}

interface UserAuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "rejected";
  error: string | null;
}

const initialState: UserAuthState = {
  user: null,
  status: "idle",
  error: null,
};

// Helper function to format user data from backend
const formatUserData = (data: any): User => {
  return {
    id: data.id || data._id,
    name: data.name || "",
    username: data.username || "",
    email: data.email || "",
    profileImage: data.profileImage || "",
    bio: data.bio || "",
    gender: data.gender,
    isVerified: data.isVerified ?? false,
    isSuspended: data.isSuspended ?? false,
    followersCount: data.followersCount ?? 0,
    followingCount: data.followingCount ?? 0,
    postCount: data.postCount ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isFollowing: data.isFollowing,
    otherUser: data.otherUser,
  };
};

export const signUpUser = createAsyncThunk(
  "signUp",
  async (userData: { name: string; email: string; password: string }, thunkAPI) => {
    try {
      console.log("Signup request:", userData);
      const response = await signUpApi(userData);
      // Format and return user data
      return formatUserData(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "An error occurred";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const singinUser = createAsyncThunk(
  "signin",
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await SigninApi(userData.email, userData.password);
      tokenService.setToken(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      // Format and return user data
      return formatUserData(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "An error occurred";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const GoogleSignUp = createAsyncThunk(
  "googleSignUp",
  async (token: string, thunkAPI) => {
    try {
      const response = await GoogleSignUpApi(token);
      tokenService.setToken(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      return formatUserData(response.data.user);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "An error occurred";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      } else {
        toast.error("Something went wrong");
        return thunkAPI.rejectWithValue("Something went wrong");
      }
    }
  }
);

export const GoogleSignIn = createAsyncThunk(
  "googleSignIn",
  async (token: string, thunkAPI) => {
    try {
      const response = await GoogleSignInApi(token);
      console.log("GoogleSignIn full response:", response.data);
      
      // Extract user and tokens from the response
      const { user, tokens } = response.data;
      
      console.log("User data:", user);
      console.log("Tokens:", tokens);
      
      // Save tokens
      tokenService.setToken(tokens.accessToken, tokens.refreshToken);
      
      toast.success('Signed in successfully');
      
      // Return formatted user data
      return formatUserData(user);
    } catch (error: unknown) {
      console.error("GoogleSignIn error:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "An error occurred";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      } else {
        toast.error("Something went wrong");
        return thunkAPI.rejectWithValue("Something went wrong");
      }
    }
  }
);

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logOut: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
      tokenService.clearToken();
    },
    updateUserData: (state, action) => {
      console.log("Updating user data:", action.payload);
      if (state.user) {
        Object.assign(state.user, formatUserData(action.payload));
      }
    },
    setUser: (state, action) => {
      state.user = formatUserData(action.payload);
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signUpUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      // Signin
      .addCase(singinUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(singinUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(singinUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      // Google Signup
      .addCase(GoogleSignUp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(GoogleSignUp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(GoogleSignUp.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      // Google Signin
      .addCase(GoogleSignIn.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(GoogleSignIn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(GoogleSignIn.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      });
  },
});

export const { logOut, updateUserData, setUser } = UserSlice.actions;
export default UserSlice.reducer;