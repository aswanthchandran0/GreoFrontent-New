// // hooks/usePeerConnection.ts
// import { useEffect, useRef, useState } from "react";
// import { Socket } from "socket.io-client";
// import { createPeerConnection } from "../utils/webrtc"; // Assuming this utility exists

// interface UsePeerConnectionProps {
//   socket: Socket | null;
//   remoteStream: MediaStream | null;
//   setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
//   localStream: MediaStream | null;
//   videoEnabled: boolean;
//   audioEnabled: boolean;
//   onIceCandidate: (candidate: RTCIceCandidate) => void;
//   onOffer: (offer: RTCSessionDescriptionInit) => void;
//   onAnswer: (answer: RTCSessionDescriptionInit) => void;
// }

// export const usePeerConnection = ({
//   socket,
//   remoteStream,
//   setRemoteStream,
//   localStream,
//   videoEnabled,
//   audioEnabled,
//   onIceCandidate,
//   onOffer,
//   onAnswer,
// }: UsePeerConnectionProps) => {
//   const peerRef = useRef<RTCPeerConnection | null>(null);

//   // Initialize peer connection and set up handlers
//   useEffect(() => {
//     const peerConnection = createPeerConnection();
//     peerRef.current = peerConnection;

//     // Add local stream tracks to the peer connection
//     if (localStream) {
//       localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
//     }

//     // Handle ICE candidates
//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         onIceCandidate(event.candidate);
//       }
//     };

//     // Handle remote stream
//     peerConnection.ontrack = (event) => {
//       setRemoteStream(event.streams[0]);
//     };

//     return () => {
//       peerConnection.close();
//     };
//   }, [localStream, socket, onIceCandidate, setRemoteStream]);

//   // Handle offer/answer logic
//   useEffect(() => {
//     if (socket) {
//       socket.on("receive-offer", onOffer);
//       socket.on("receive-answer", onAnswer);
//     }

//     return () => {
//       if (socket) {
//         socket.off("receive-offer", onOffer);
//         socket.off("receive-answer", onAnswer);
//       }
//     };
//   }, [socket, onOffer, onAnswer]);

//   return { peerConnection: peerRef.current };
// };
