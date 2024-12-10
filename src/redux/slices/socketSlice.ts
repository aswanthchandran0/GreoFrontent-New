// // redux/socketSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { Socket } from 'socket.io-client';
// import { MySocketEvents } from '../../Types/MySocketEventsTypes';

// interface SocketState {
//   socket: Socket<any, any> | null;
// }

// const initialState: SocketState = {
//   socket: null,
// };

// export const socketSlice = createSlice({
//   name: 'socket',
//   initialState,
//   reducers: {
//     setSocket: (state, action: PayloadAction<Socket<any, any>>) => {
//       state.socket = action.payload
//     },
//     disconnectSocket: (state) => { 
//       state.socket?.disconnect();
//       state.socket = null;
//     },
//   },
// });

// export const { setSocket, disconnectSocket } = socketSlice.actions;

// export default socketSlice.reducer;
