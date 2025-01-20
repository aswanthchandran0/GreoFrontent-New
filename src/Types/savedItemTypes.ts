import { IRoll } from "../components/userComponents/profile/UserPosts";
import { IPost } from "./postTypes";

export interface SavedItemArrayElement {
  itemId:string;
  type: 'post' | 'roll';  
  collectionName?: string;
}  
  


export interface SavedItem {
  type: "post" | "roll";
  userId: string;  // ID of the user who saved the post
  items: {
    type: "post" | "roll";
    postData?: IPost; // Assuming `IPost` is the type for posts
    rollData?: IRoll; // Assuming `IRoll` is the type for rolls
  }[]; // Corrected to an array
}
