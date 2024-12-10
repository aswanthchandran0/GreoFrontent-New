import {io,Socket} from 'socket.io-client'
import { MySocketEvents } from '../Types/MySocketEventsTypes'

let socket:Socket<MySocketEvents, MySocketEvents> | null = null


export const getSocketInstance = () =>{
    if(!socket){
        console.log("connecting to socket server")
        socket = io(import.meta.env.VITE_SOCKET_PORT,{
            withCredentials:true,
            transports:["websocket"]
        })

        socket.on('connect',()=>{
            console.log('Socket is connected')
        })

        socket.on("disconnect",()=>{
            console.log('Socket disconnected')
        })
    }
    return socket
}