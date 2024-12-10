
const FileInput = ({onSelectedFile,acceptType = 'image'})=>{

    const handleOnChange = (e)=>{
        if(e.target.files && e.target.files.length>0){
        const reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onload = (e)=>{
            onSelectedFile(reader.result)
        }
        }
    }

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