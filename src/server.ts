import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./controllers/errorHandler";
import { findOrCreateConversation } from "./libs/conversation";
dotenv.config();
const port = process.env.PORT || 7272;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const nCPUs = os.cpus().length;

console.log(`The total number of CPUs is ${nCPUs}`);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
app.use(errorHandler);

app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
  socket.on("message", async (data) => {
    const { userId, conversationId, message } = data;
    console.log(userId, conversationId, message);
    // const conversation = await findOrCreateConversation(userId, userId);
    // console.log(conversation);
  });
});
//

// // io.emit("chat message", msg, result.lastID);

// });

//  Express listen
server.listen(`${port}`, () => {
  console.log(`Server is ready on port:${port}`);
});
