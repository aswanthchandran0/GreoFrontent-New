import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { tokenService } from "../../services/user/tokenService";
import { GoogleSignInApi, GoogleSignUpApi, SigninApi, signUpApi } from "../../services/user/api";
import toast from "react-hot-toast";

export const signUpUser = createAsyncThunk(
  "signUp",
  async (
    userData: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await signUpApi(userData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "An error occurred";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      else return thunkAPI.rejectWithValue("Something went wrong");
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
      return response.data.user;
    } catch (error) {
     
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "An error occurred";
        toast.error(errorMessage);
        return thunkAPI.rejectWithValue(errorMessage)
      }
      else return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const GoogleSignUp = createAsyncThunk(
  "googleSignUp",
  async (token:string, thunkAPI) => {
    try{
     const response = await GoogleSignUpApi(token)
     tokenService.setToken(response.data.tokens.accessToken, response.data.tokens.refreshToken)
     return response.data.user
    }
    catch (error: unknown) {
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
) 


export const GoogleSignIn = createAsyncThunk(
  "googleSignIn",
  async(token:string, thunkAPI) => {
    try{
      const response = await GoogleSignInApi(token)
      tokenService.setToken(response.data.tokens.accessToken, response.data.tokens.refreshToken)
      toast.success('signIn successfully')
      return response.data.user
    }
    catch (error: unknown) {
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

)

type UserGender = "prefer not to say" | "male" | "female" | "other";
type LastSeenOnline = "Everyone" | "private" | "hide";

export interface User {
  id: string;
  profileImage: string;
  name: string;
  user_name: string;
  email: string;
  user_bio: string;
  lastseen_online: LastSeenOnline;
  password: string;
  is_suspended: boolean;
  user_gender: UserGender;
  private_account: boolean;
  publicKey?: string;
  otherUser?:boolean
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
    updateUserData:(state,action)=>{
      if(state.user) state.user = {...state.user, ...action.payload}
    }
  },
  extraReducers: (builder) => {
    builder
      //signup
      .addCase(signUpUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      // singin
      .addCase(singinUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(singinUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(singinUser.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      //google signup
      .addCase(GoogleSignUp.pending, (state) => {
        state.status = "loading";
      })
      .addCase(GoogleSignUp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(GoogleSignUp.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      })
      //google signin
      .addCase(GoogleSignIn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(GoogleSignIn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(GoogleSignIn.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload as string;
      });
  },
});

export const { logOut,updateUserData } = UserSlice.actions;
export default UserSlice.reducer;
