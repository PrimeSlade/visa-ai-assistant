import { Router } from "express";
import {
  generateReplyFromMessageHandler,
  getChatHistoryHandler,
} from "../controllers/chat.controller";
import { requireAuth } from "../middleware/requireAuth";

const chatRouter = Router();

chatRouter.get("/chat-history", requireAuth, getChatHistoryHandler);
chatRouter.post("/chat-reply", requireAuth, generateReplyFromMessageHandler);

export default chatRouter;
