// import { useState } from "react"
// import Cropper from "react-easy-crop"
// import { FaArrowLeftLong } from "react-icons/fa6";
// import { TbArrowsDiagonal } from "react-icons/tb";

// interface CroppedAreaPixels {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }

// interface ImageCropperProps {
//   image: string | null;
//   onCropDone: (dataURL: string) => void; 
//   onCropCancel: () => void; 
//   isAspectRatios: boolean;
// }

// const ImageCropper: React.FC<ImageCropperProps>  = ({image,onCropDone,onCropCancel,isAspectRatios})=>{
//     const [crop,setCrop] = useState({x:0,y:0})
//     const [zoom,setZoom] = useState(1)
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
//     const [aspect, setAspect] = useState(1)
//     const [showAspectOptions, setShowAspectOptions] = useState(false)
//     const onCropComplete = (_: unknown, croppedAreaPixels: CroppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//       };

//       const handleCrop = () => {
//         if (!croppedAreaPixels) return;
    
//         const canvas = document.createElement("canvas");
//         const context = canvas.getContext("2d");
//         const imageElement = new Image();
//         imageElement.src = image ?? '';
    
//         imageElement.onload = () => {
//           canvas.width = croppedAreaPixels.width;
//           canvas.height = croppedAreaPixels.height;
//           context?.drawImage(
//             imageElement,
//             croppedAreaPixels.x,
//             croppedAreaPixels.y,
//             croppedAreaPixels.width,
//             croppedAreaPixels.height,
//             0,
//             0,
//             croppedAreaPixels.width,
//             croppedAreaPixels.height
//           );
    
//           const dataURL = canvas.toDataURL("image/jpeg");
//           onCropDone(dataURL);
//         };
//       };

//       const toggleAspectOptions = () => {
//         setShowAspectOptions((prev) => !prev);
//       };

      
//   const handleAspectChange = (newAspect: number) => {
//     setAspect(newAspect);
//     setShowAspectOptions(false); // Hide options after selection
//   };
  
//     return(
//         <div  className="fixed inset-0 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
// <div className="flex flex-col items-center justify-center w-full h-full bg-opacity-50 bg-background-dark ">
//     <div className="flex flex-col w-full h-[30rem] md:max-h-[35rem]  max-w-[32rem] bg-background-light dark:bg-black rounded">
     
//           <div className="flex flex-row items-center justify-between p-2 mx-1 rounded">
//           <FaArrowLeftLong  className="text-xl cursor-pointer text-text-black dark:text-text-white" onClick={onCropCancel}/>
//            <span className="font-bold text-md text-text-black font-golos dark:text-text-white font-gaolos">crop</span>
//            <span className="text-blue-500 cursor-pointer text-md font-golos"  onClick={handleCrop}>Next</span>
//           </div>
//         <div className="relative w-full h-96">
//         <Cropper
//     image={image ?? undefined}
//     crop={crop}
//     zoom={zoom}
//     aspect={aspect}
//     onCropChange={setCrop}
//     onZoomChange={setZoom}
//     onCropComplete={onCropComplete}
//     />
//         </div>
//         {
//           isAspectRatios && (
//             <div className="relative p-2 mx-1">
//             <TbArrowsDiagonal className="text-lg cursor-pointer text-text-black dark:text-text-white"  onClick={toggleAspectOptions}/>
//             {showAspectOptions && (
//                         <div className="absolute mb-2 rounded shadow-lg text-text-Grayish dark:text-white bg-background-light dark:bg-black bottom-full">
//                           <div className="flex flex-col">
//                             <button onClick={() => handleAspectChange(1)} className="p-2 hover:bg-gray-700">1:1</button>
//                             <button onClick={() => handleAspectChange(4 / 5)} className="p-2 hover:bg-gray-700">4:5</button>
//                             <button onClick={() => handleAspectChange(16 / 9)} className="p-2 hover:bg-gray-700">16:9</button>
//                           </div>
//                         </div>
//                       )}
//             </div>
//           )
//         }
 

//     </div>

   
// </div>

// </div>
//     )
// }


// export default ImageCropper

// src/components/ui/ImageCropper.tsx
import { useState } from "react"
import Cropper from "react-easy-crop"
import { FaArrowLeftLong } from "react-icons/fa6";
import { TbArrowsDiagonal } from "react-icons/tb";
import { motion } from "framer-motion";

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
        imageElement.src = image ?? '';
    
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
    
          const dataURL = canvas.toDataURL("image/jpeg", 0.95);
          onCropDone(dataURL);
        };
    };

    const toggleAspectOptions = () => {
        setShowAspectOptions((prev) => !prev);
    };

    const handleAspectChange = (newAspect: number) => {
        setAspect(newAspect);
        setShowAspectOptions(false);
    };

    const aspectOptions = [
        { label: "Square (1:1)", value: 1 },
        { label: "Portrait (4:5)", value: 4/5 },
        { label: "Landscape (16:9)", value: 16/9 },
        { label: "Instagram Post (1:1)", value: 1 },
        { label: "Instagram Story (9:16)", value: 9/16 },
    ];
  
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full p-4 bg-black/70">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCropCancel}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <FaArrowLeftLong className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Crop Image
                        </h2>
                    </div>
                    <button
                        onClick={handleCrop}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Apply Crop
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-hidden">
                    <div className="relative w-full h-96 md:h-[500px]">
                        {image && (
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                classes={{
                                    containerClassName: "bg-black",
                                    mediaClassName: "max-h-full max-w-full"
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Zoom Control */}
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Zoom: {zoom.toFixed(1)}x
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Aspect Ratio Control */}
                        {isAspectRatios && (
                            <div className="relative">
                                <button
                                    onClick={toggleAspectOptions}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <TbArrowsDiagonal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {aspectOptions.find(opt => opt.value === aspect)?.label || "Custom"}
                                    </span>
                                </button>
                                
                                {showAspectOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                                    >
                                        <div className="py-1">
                                            {aspectOptions.map((option) => (
                                                <button
                                                    key={option.label}
                                                    onClick={() => handleAspectChange(option.value)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                        aspect === option.value
                                                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                                            : "text-gray-700 dark:text-gray-300"
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default ImageCropper;