import { Router } from "express";
import { analyze } from "../controllers/Analyze.controller";
const analyzeRouter = Router();

analyzeRouter.post('/analyze', analyze);
export default analyzeRouter;
