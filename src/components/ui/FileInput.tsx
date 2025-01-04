import toast from "react-hot-toast"

interface Props{
    onSelectedFile:(file:File)=>void
    acceptType:string
}

const FileInput:React.FC<Props> = ({onSelectedFile,acceptType = 'image'})=>{
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        if(e.target.files && e.target.files.length>0){
        const file = e.target.files[0]
        
        // handle video validation for reel
        if(acceptType == "video" && file.type.startsWith("video/")){
            const video = document.createElement("video");
            video.preload = "metadata";

            video.onloadedmetadata = ()=>{
                window.URL.revokeObjectURL(video.src)
                const duration = video.duration

                if(duration <15 || duration >60){
                    toast.error("video length must be betweeen 15 and 60 seconds ")
                    return
                }
                readFile(file)
            }
            video.onerror = ()=>{
                toast.error("invalid video type")
            }
            video.src = URL.createObjectURL(file)
            console.log(
                'video src',video.src
            )
        }else if(acceptType == "image" && file.type.startsWith('image/')){
                readFile(file)
        } else{
            toast.error('invalid file type  please select valid file')
        }
        }
    }

    const readFile = (file:File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          onSelectedFile(reader.result);
        };
      };

    const getAcceptType = ()=>{
        if(acceptType ==='image') return "image/*"
        if(acceptType ==='video') return "video/*"
        if(acceptType === 'both') return "image/*,video/*"
        return "image/*"
    }
    return(
         <input 
         type="file"
         accept={getAcceptType()}
         onChange={handleOnChange}
          className="absolute w-full h-full opacity-0 cursor-pointer "
         />
    )
}

export default FileInput