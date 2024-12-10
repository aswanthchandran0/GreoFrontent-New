// // CropImage.js
// import React, { useState } from 'react';
// import Cropper from 'react-easy-crop';
// import { RxBox } from "react-icons/rx";
// import { LuRectangleHorizontal } from "react-icons/lu";
// import { TbRectangleVertical } from "react-icons/tb";
// const ImageCrop = ({ image, onCropComplete, onCancel }) => {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);

//   const handleCropComplete = (croppedArea, croppedAreaPixels) => {
//     onCropComplete(croppedAreaPixels);
//   };

//   return (
//     <div className="inset-0 flex items-center justify-center w-full h-72">
//       <div>
//       <Cropper
//         image={image}
//         crop={crop}
//         zoom={zoom}
//         aspect={1} // Square crop
//         onCropChange={setCrop}
//         onZoomChange={setZoom}
//         onCropComplete={handleCropComplete}
//       />
//       </div>
//       <div className='flex flex-row justify-between w-full mt-4'>

//       <button onClick={onCancel} className="p-2 text-white bg-red-500 rounded">
//         Cancel
//       </button>
      
//       <button onClick={()=>handleCropComplete(crop,{ x: crop.x, y: crop.y, width: zoom * 100, height: zoom * 100 })}>
//         crop
//       </button>
//       </div>
//     </div>
//   );
// };

// export default ImageCrop;
