import { Router } from "express";
import { getChatHistoryHandler } from "../controllers/chat.controller";

const chatRouter = Router();

chatRouter.get("/chat-history", getChatHistoryHandler);

export default chatRouter;
