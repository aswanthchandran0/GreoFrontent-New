

// const startMediaStream = async ()=>{
//     try{
//       const localStream =  await navigator.mediaDevices.getUserMedia({video:true,audio:true})
//       const localVideo = document.getElementById('localVideo')
//       localVideo.scrObject = localStream
//      localStream.getTracks().forEach((track) => peerConnection.addTrack(track,localStream))
//     }catch(error){
//         console.error("Error accessing media devices:",error)
//     }
// }