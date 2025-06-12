import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";

export const analyzeText = (req: Request, res: Response) => {
    const { input } = req.body;
    const analyzer = new LexicalAnalyzer();
    const tokens = analyzer.scanner(input); // Implementa scanner luego
    const errors = analyzer.getErrorList ? analyzer.getErrorList() : [];
    res.json({ tokens, errors });
};