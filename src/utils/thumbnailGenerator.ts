
interface IthumbnailProps{
    base64Video:string,
    timeInSeconds?:number
}

export const generateThumbnail = async ({base64Video, timeInSeconds = 1}:IthumbnailProps):Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = base64Video;
  
      video.addEventListener('loadeddata', () => {
        video.currentTime = timeInSeconds; // Set the time to capture frame
      });
  
      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            reject('Failed to get canvas context');
            return;
          }
    
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        // Get the base64 representation of the thumbnail
        const thumbnail = canvas.toDataURL('image/png');
        resolve(thumbnail);
      });
  
      video.addEventListener('error', (err) => {
        reject(`Error generating thumbnail: ${err.message}`);
      });
    });
  };
  