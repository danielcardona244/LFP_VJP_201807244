import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
export const analyze = (req: Request, res: Response) => {
    
    let scanner: LexicalAnalyzer = new LexicalAnalyzer();

    scanner.scanner(req.body);

    res.json({
        "tokens": scanner.getTokenList(),
        "errors": scanner.getErrorList()
    });
}