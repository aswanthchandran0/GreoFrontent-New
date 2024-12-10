

export const createPeerConnection = ()=>{

    const peerConnection = new RTCPeerConnection({
        iceServers:[
            {urls:"stun:stun.l.google.com:19302"}
        ]
    })

    peerConnection.onicecandidate = (event)=>{
        if(event.candidate){
            console.log("New ICE candidate:", event.candidate)
            // Emit the ICE candidate through your signaling server
        }
    }
    return peerConnection;
}


