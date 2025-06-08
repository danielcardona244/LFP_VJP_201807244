import { Router } from "express";
import { analyzeText, showTeam } from "../controllers/Analyze.controller";

const router = Router();

router.post("/analyze", analyzeText);
router.get("/team", showTeam);

export default router;