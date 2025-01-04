
import Post from '../components/userComponents/post/Post'


const HomeScreen = ()=>{


    return(
       <>
       <div className='flex h-full dark:bg-background-dark bg-background-light md:max-h-[90vh] max-h-[83vh] lg:px-16 justify-center scroll-smooth '>
      <Post/>
       </div>
         </>
    )
}

export default HomeScreen