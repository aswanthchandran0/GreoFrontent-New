import { SavedItemCardProps } from "../components/userComponents/profile/SavedItemCard";
import { IRoll } from "../components/userComponents/profile/UserPosts";
import { Post } from "../interface/userInterface";
import { IPost } from "./postTypes";

export interface SavedItemArrayElement {
  itemId:string;
  type: 'post' | 'roll';  
  collectionName?: string;
}  
  


export interface SavedItem {
  type: "post" | "roll";
  userId: string;  // ID of the user who saved the post
  items:SavedItemCardProps
}
