import { useState } from "react"

export const usePosts = ()=>{
    const [posts,setPosts] = useState({})
 
    setPosts(  {
    userImage:'logo.png',
    userName:'@Abel Makkonen',
    name:'Abel Makkonen Tesfaye',
    mediaUrl:'du2h5nss2bvulnrht9od.jpg',
    content:'The Weekend—a modern classic that resonates beyond the ordinary. Let the music speak to the complexities of love, time, and emotion'
  })
    return {posts}
}