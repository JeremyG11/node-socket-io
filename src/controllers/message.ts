import { Server } from "socket.io";
import { prisma } from "../libs/db";
import { Request, Response } from "express";

export const sendMessage = async (io: Server, req: Request, res: Response) => {
  const { message } = req?.body;

  // Validate message content
  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  try {
    // const result = await prisma.message.create({
    //   data: {
    //     content: message,
    //   },
    // });

    io.emit("message", message);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    if (error.code === "P2002") {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        senderProfile: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });
    console.log(messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
