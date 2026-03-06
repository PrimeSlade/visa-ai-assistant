import { Router } from "express";
import {
  deleteMyConversationHandler,
  generateReplyFromMessageHandler,
  generateReplyHandler,
  getChatHistoryHandler,
} from "../controllers/chat.controller";
import { testGemini } from "../controllers/gemini.controller";
import {
  getAdminPromptByNameHandler,
  improveAiHandler,
  improveAiBudgetHandler,
  improveAiManuallyHandler,
  updateConsultantPromptHandler,
} from "../controllers/prompt.controller";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

//chat endpoints
router.get("/chat-history", requireAuth, getChatHistoryHandler);
router.post("/chat-reply", requireAuth, generateReplyFromMessageHandler);
router.delete("/me/conversation", requireAuth, deleteMyConversationHandler);

//main 3 endpoints
router.post("/generate-reply", generateReplyHandler);
router.post("/improve-ai", improveAiHandler);
router.post("/improve-ai-manually", improveAiManuallyHandler);

router.post(
  "/improve-ai-budget",
  requireAuth,
  requireAdmin,
  improveAiBudgetHandler
);

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
