import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes";
import socketRoutes from "./routes/socketRoutes";
import { findOrCreateConversation } from "./libs/conversation";
import { withUseDeserializer } from "./middlewares/setUserMiddleware";

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

io.on("connection", (socket) => {
  socket.on("message", async (data) => {
    const { userId, receiverId, message } = data;
    const conversation = await findOrCreateConversation(userId, receiverId);
    console.log(conversation);
  });
});
//

// io.emit("chat message", msg, result.lastID);

// });

//  Express listen
server.listen(`${port}`, () => {
  console.log(`Server is ready on port:${port}`);
});
