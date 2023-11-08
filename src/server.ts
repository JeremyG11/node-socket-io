import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction } from "express";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import { CustomSocket } from "types";
import authRoutes from "./routes/authRoutes";
import socketRoutes from "./routes/socketRoutes";
import { withUseDeserializer } from "./middlewares/setUserMiddleware";
import { findOrCreateConversation } from "./libs/conversation";

dotenv.config();
const port = process.env.PORT || 7272;
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(withUseDeserializer);

// Routes middlewares
app.use("/api/auth", authRoutes);
app.use("/api/messages", socketRoutes);

const server = http.createServer(app);
const nCPUs = os.cpus().length;
console.log(`The total number of CPUs is ${nCPUs}`);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//  middleware for io
io.use((socket: CustomSocket, next: NextFunction) => {
  const auth = socket.handshake.auth.user;
  if (!auth) {
    return next(new Error("No authenticated user"));
  }
  socket.user = socket.handshake.auth.user;

  next();
});

// on socket connection
io.on("connection", (socket: CustomSocket) => {
  socket.join(socket.user.id);

  // A catch-all listener
  socket.onAny((event, ...args) => {
    // console.log(event, args);
  });

  const activeUsers = [];
  for (let [id, socket] of io.of("/").sockets) {
    activeUsers.push({
      socketId: id,
      ...socket.handshake.auth,
    });
  }
  socket.emit("active-users", activeUsers);

  socket.broadcast.emit("user connected", {
    socketId: socket.id,
    userData: { ...socket.handshake.auth },
  });

  // session
  socket.emit("session", {
    user: socket.user,
  });

  // Listening to Direct Messages
  socket.on("private message", async ({ content, to }) => {
    io.to(to)
      .to(socket.user.id)
      .emit("private message", {
        ...content,
        from: socket.user,
        to,
      });

    // message to database
    try {
      const conversation = await findOrCreateConversation(socket.user.id, to);
      await prisma.message.create({
        data: {
          ...content,
          conversationId: conversation.id,
          senderId: socket.user.id,
        },
      });
    } catch (err) {
      console.log(err);
    }
  });

  // typing
  socket.on("typing", (to) => {
    socket.broadcast.to(to).emit("broadcast typing", {});
  });

  // Disconnect user
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.user.id).fetchSockets();
    console.log(matchingSockets);
    // const isDisconnected = matchingSockets.size === 0;
    // if (isDisconnected) {
    //   socket.broadcast.emit("user disconnected", socket.user.id);
    //   // update the connection status of the session
    // }
  });
});

//  Express listen
server.listen(`${port}`, () => {
  console.log(`⚡ Server is ready on port:${port} 🔥`);
});
