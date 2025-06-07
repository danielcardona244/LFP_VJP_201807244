import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";

export const analyzeText = (req: Request, res: Response) => {
  const { input } = req.body; // El texto a analizar debe venir en el body
  const analyzer = new LexicalAnalyzer();
  const tokens = analyzer.scanner(input);
  const errors = analyzer.getErrorList();

  res.json({
    tokens,
    errors
  });
};