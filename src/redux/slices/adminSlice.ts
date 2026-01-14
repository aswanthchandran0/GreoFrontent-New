import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tokenService } from "../../services/user/tokenService";
import { adminSigninApi } from "../../services/admin/adminApi";
import axios from "axios";
import toast from "react-hot-toast";





// thunk middleware 

export const adminAuthenticate = createAsyncThunk(
    "adminAuthenticate",
    async (adminData:{email:string,password:string},thunkAPI) =>{
     try{
        const response = await adminSigninApi(adminData.email,adminData.password)
        console.log('response',response)
        tokenService.setAdminToken(response.data.accessToken)
        return response.data.admin
     }catch(error){
        toast.error("invalid credential")
        if (axios.isAxiosError(error))
            thunkAPI.rejectWithValue(error.response?.data?.error);
          else return thunkAPI.rejectWithValue("Something went wrong");
        }
    }
)



export interface admin{
    email:string,
    password:string
}

interface adminAuthState{
    admin: admin |null,
    status: "idle" | "loading" | "succeeded" | "rejected";
    error: string | null;
}

const initialState:adminAuthState = {
   admin:null,
   status: "idle",
   error:'null'
}



const adminSlice = createSlice({
    name:"admin",
    initialState,
    reducers:{
        adminLogOut:(state)=>{
            state.admin = null
            state.error = null
            state.status = "idle"
            tokenService.adminClearToken()
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(adminAuthenticate.pending,(state)=>{
            state.status = "loading"
        })
        .addCase(adminAuthenticate.fulfilled,(state,action)=>{
            state.status = "succeeded"
            state.admin = action.payload
        })
        .addCase(adminAuthenticate.rejected,(state,action)=>{
            state.status = "rejected"
            state.error = action.payload as string
        })
    }
})

export const {adminLogOut} = adminSlice.actions
export default adminSlice.reducer