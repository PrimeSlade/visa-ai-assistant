import { Router } from "express";
import { testGemini } from "../controllers/geminiController";
import { generateReplyHandler } from "../controllers/generateReplyController";
import { improveAiHandler } from "../controllers/improveAiController";
import { improveAiManuallyHandler } from "../controllers/improveAiManuallyController";

const router = Router();

router.post("/generate-reply", generateReplyHandler);
router.post("/improve-ai", improveAiHandler);
router.post("/improve-ai-manually", improveAiManuallyHandler);
//for testing gemini api
router.post("/api/gemini/test", testGemini);

export default router;
