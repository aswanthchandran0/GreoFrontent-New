import { User } from "../redux/slices/userSlice";

export interface IgoogleSignIn{
user:User,
token:{
    access_token: string;
        refreshToken: string;
}
}