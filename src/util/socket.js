// src/util/socket.js
import io from 'socket.io-client';
const socket = io(process.env.REACT_APP_API_BASE, {
  transports: ["websocket", "polling"], 
  // autoConnect: true,  
  // reconnection: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5, 
    reconnectionDelay: 2000
  });
export default socket;
