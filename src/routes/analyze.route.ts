import { Router } from "express";
import { analyzeText } from "../controllers/Analyze.controller";

const router = Router();

router.post("/analyze", analyzeText);

export default router;