import { useState } from "react"
import Cropper from "react-easy-crop"
import { RxBox } from "react-icons/rx";
import { LuRectangleHorizontal } from "react-icons/lu";
import { TbRectangleVertical } from "react-icons/tb";
import { FaArrowLeftLong } from "react-icons/fa6";
import { TbArrowsDiagonal } from "react-icons/tb";

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}


interface ImageCropperProps {
  image: string | null;
  onCropDone: (dataURL: string) => void; 
  onCropCancel: () => void; 
  isAspectRatios: boolean;
}

const ImageCropper: React.FC<ImageCropperProps>  = ({image,onCropDone,onCropCancel,isAspectRatios})=>{
    const [crop,setCrop] = useState({x:0,y:0})
    const [zoom,setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
    const [aspect, setAspect] = useState(1)
    const [showAspectOptions, setShowAspectOptions] = useState(false)
    const onCropComplete = (_: unknown, croppedAreaPixels: CroppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
      };

      const handleCrop = () => {
        if (!croppedAreaPixels) return;
    
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const imageElement = new Image();
        imageElement.src = image;
    
        imageElement.onload = () => {
          canvas.width = croppedAreaPixels.width;
          canvas.height = croppedAreaPixels.height;
          context?.drawImage(
            imageElement,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          );
    
          const dataURL = canvas.toDataURL("image/jpeg");
          onCropDone(dataURL);
        };
      };

      const toggleAspectOptions = () => {
        setShowAspectOptions((prev) => !prev);
      };

      
  const handleAspectChange = (newAspect: number) => {
    setAspect(newAspect);
    setShowAspectOptions(false); // Hide options after selection
  };
  
    return(
        <div  className="fixed inset-0 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
<div className="flex flex-col items-center justify-center w-full h-full bg-opacity-50 bg-background-dark ">
    <div className="flex flex-col w-full h-[30rem] md:max-h-[35rem]  max-w-[32rem] bg-black rounded">
     
          <div className="flex flex-row items-center justify-between p-2 mx-1 rounded">
          <FaArrowLeftLong  className="text-xl cursor-pointer text-text-white" onClick={onCropCancel}/>
           <span className="text-md text-text-white font-gaolos">crop</span>
           <span className="text-blue-500 cursor-pointer text-md font-golos"  onClick={handleCrop}>Next</span>
          </div>
        <div className="relative w-full h-96">
        <Cropper
    image={image}
    crop={crop}
    zoom={zoom}
    aspect={aspect}
    onCropChange={setCrop}
    onZoomChange={setZoom}
    onCropComplete={onCropComplete}
    />
        </div>
        {
          isAspectRatios && (
            <div className="relative p-2 mx-1">
            <TbArrowsDiagonal className="text-lg cursor-pointer text-text-white"  onClick={toggleAspectOptions}/>
            {showAspectOptions && (
                        <div className="absolute mb-2 text-white bg-black rounded shadow-lg bottom-full">
                          <div className="flex flex-col">
                            <button onClick={() => handleAspectChange(1)} className="p-2 hover:bg-gray-700">1:1</button>
                            <button onClick={() => handleAspectChange(4 / 5)} className="p-2 hover:bg-gray-700">4:5</button>
                            <button onClick={() => handleAspectChange(16 / 9)} className="p-2 hover:bg-gray-700">16:9</button>
                          </div>
                        </div>
                      )}
            </div>
          )
        }
 
{/* <div>
  <select name="" id=""></select>
</div> */}
        {/* <div className="flex gap-3 ">
          <button onClick={onCropCancel} className="p-2 px-10 rounded bg-background-dark hover:bg-background-EerieBlack text-text-white">Cancel</button>       
          <button onClick={handleCrop} className="p-2 px-10 bg-indigo-500 rounded hover:bg-indigo-600 text-text-white">Crop</button>       
 </div> */}
    </div>

   
</div>

</div>
    )
}


export default ImageCropper