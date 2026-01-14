import { IRoll } from "../components/userComponents/profile/UserPosts";
import { IPost } from "./postTypes";

export interface SavedItemArrayElement {
  itemId:string;
  itemType: 'POST' | 'REEL';  
  collectionName?: string;
}  
  


export interface SavedItem {
  type: "post" | "roll";
  userId: string;  // ID of the user who saved the post
  items: {
    itemType: "POST" | "REEL";
    postData?: IPost; // Assuming `IPost` is the type for posts
    rollData?: IRoll; // Assuming `IRoll` is the type for rolls
  }[]; // Corrected to an array
}
