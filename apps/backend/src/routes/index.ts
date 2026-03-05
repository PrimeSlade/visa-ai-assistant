import { Router } from "express";
import { generateReplyHandler } from "../controllers/chat.controller";
import { testGemini } from "../controllers/gemini.controller";
import {
  getAdminPromptByNameHandler,
  improveAiHandler,
  improveAiManuallyHandler,
  updateConsultantPromptHandler,
} from "../controllers/prompt.controller";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/requireAuth";
import chatRouter from "./chat.routes";

const router = Router();

router.use(chatRouter);

//main 3 endpoints
router.post("/generate-reply", generateReplyHandler);
router.post("/improve-ai", improveAiHandler);
router.post("/improve-ai-manually", improveAiManuallyHandler);

router.get(
  "/admin/prompts",
  requireAuth,
  requireAdmin,
  getAdminPromptByNameHandler
);
router.patch(
  "/admin/prompts/consultant",
  requireAuth,
  requireAdmin,
  updateConsultantPromptHandler
);

//for testing gemini api
router.post("/api/gemini/test", testGemini);

export default router;
