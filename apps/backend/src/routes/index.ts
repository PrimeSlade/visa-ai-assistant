import { Router } from "express";
import { generateReplyHandler } from "../controllers/chat.controller";
import { testGemini } from "../controllers/gemini.controller";
import {
  improveAiHandler,
  improveAiManuallyHandler,
} from "../controllers/prompt.controller";
import chatRouter from "./chat.routes";

const router = Router();

router.use(chatRouter);

//main 3 endpoints
router.post("/generate-reply", generateReplyHandler);
router.post("/improve-ai", improveAiHandler);
router.post("/improve-ai-manually", improveAiManuallyHandler);
//for testing gemini api
router.post("/api/gemini/test", testGemini);

export default router;
