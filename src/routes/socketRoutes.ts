import express from "express";
const router = express.Router();
import { io } from "../server";

import { getMessages, sendMessage } from "../controllers/message";

router.post("/send", (req, res) => {
  sendMessage(io, req, res);
});

router.get("/", (req, res) => {
  getMessages(req, res);
});

export default module.exports = router;
