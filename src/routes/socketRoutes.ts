import express, { Request, Response } from "express";
const router = express.Router();

import { io } from "../server";
import validator from "../middlewares/validationMiddleware";
import {
  sendMessageSchema,
  conversationSchema,
} from "../schemas/message.schema";
import { withAuthUser } from "../middlewares/authUserMiddleware";
import {
  getConversation,
  getMessages,
  sendMessageController,
} from "../controllers/message";

router.post(
  "/send",
  validator(sendMessageSchema),
  withAuthUser,
  (req: Request, res: Response) => {
    sendMessageController(io, req, res);
  }
);

router.get(
  "/conversation",
  validator(conversationSchema),
  withAuthUser,
  getConversation
);

router.get("/", withAuthUser, (req: Request, res: Response) => {
  getMessages(io, req, res);
});

export default module.exports = router;
