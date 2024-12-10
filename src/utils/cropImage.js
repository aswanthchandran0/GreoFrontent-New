// import { createCanvas, loadImage } from "canvas";

// const getCroppedImg = async (imageSrc, crop) => {
//     const image = await loadImage(imageSrc);
//     const canvas = createCanvas(crop.width, crop.height);
//     const ctx = canvas.getContext("2d");

//     ctx.drawImage(
//         image,
//         crop.x,
//         crop.y,
//         crop.width,
//         crop.height,
//         0,
//         0,
//         crop.width,
//         crop.height
//     );

//     return canvas.toDataURL(); // Get base64 image data
// };

// export default getCroppedImg;