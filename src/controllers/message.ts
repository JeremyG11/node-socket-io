import { Server } from "socket.io";
import { prisma } from "../libs/db";
import { Request, Response } from "express";
import { findOrCreateConversation } from "../libs/conversation";

export const getConversation = async (req: Request, res: Response) => {
  const { receiverId } = req.query;
  try {
    const conversation = await findOrCreateConversation(
      res.locals.user?.id,
      receiverId as string
    );
    res.status(200).json(conversation);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
export const sendMessageController = async (
  io: Server,
  req: Request,
  res: Response
) => {
  try {
    const { message } = req.body;
    const { receiverId } = req.query;

    const conversation = await findOrCreateConversation(
      res.locals.user?.id,
      receiverId as string
    );

    const result = await prisma.message.create({
      data: {
        content: message,
        conversationId: conversation?.id,
        senderId: res.locals.user?.id,
      },
    });
  } catch (error) {
    console.log(error);
    // res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (io: Server, req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        conversation: {
          select: {
            userProfileOne: true,
          },
        },
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

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
