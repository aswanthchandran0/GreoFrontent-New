
export const getUserMedia = async (video:boolean,audio:boolean) =>{
    try{
     const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio
     })
     return stream
    }catch(error){
        console.error("Error accessing user media:", error);
        throw error;
    }
}