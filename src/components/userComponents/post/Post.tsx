
import PostCard from "./PostCard"
const Post =()=>{

    return(
        <>
        <div className="flex flex-col bg-background-light dark:bg-background-dark md:mt-10  space-y-3  overflow-y-scroll scrollbar-hide">
                <PostCard />
                <PostCard />
                <PostCard />
        </div>
        </>
    )
}


export default Post