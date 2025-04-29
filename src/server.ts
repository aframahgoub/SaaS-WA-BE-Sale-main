import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import { Server  } from "socket.io";

import http from "http"
const port=env.PORT||process.env.PORT;

mongoose.connect(env.MONGO_CONNECTION_STRING).then(() => {
  console.log("mongoose connected"); 
}).catch((error)=>{
    console.error(error)
});

const server =http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  },
});


//Socket.io Connection
io.on("connection",(socket)=>{
  console.log("a user connected", socket.id);
  console.log(io.engine.clientsCount);
  //socket.disconnect()

  // if(io.engine.clientsCount>10){
  //   socket.disconnect()
  // }

  socket.on("userSetup", (userId) => {
    console.log("user with ",userId," joined"); 
    socket.join(userId);
  });
 
  socket.on("disconnect", (reason) => {
    console.log("user disconnected", reason);
  });
})

server.listen(port || 3000, () => {
  console.log("server is running on port " + port);
});