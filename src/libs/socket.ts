import { Server } from "socket.io";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("disconnect", () => {
      console.log(`Client disconnected:`, socket.id);
    });
  });
};
