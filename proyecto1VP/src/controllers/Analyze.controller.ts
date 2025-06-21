import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { generarHTMLPensum } from "../Generator/htmlGenerator";
import { TokenType } from "../Analyzer/Tokens";

export const analyzeText = (req: Request, res: Response): void => {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
        res.status(400).json({
            tokens: [],
            lexErrors: [{
                row: 0,
                column: 0,
                lexeme: "",
                description: "No se recibió texto para analizar."
            }],
            html: ""
        });
        return;
    }

    // 1. Análisis léxico
    const analyzer = new LexicalAnalyzer();
    const tokens = analyzer.scanner(input);
    const lexErrors = analyzer.getErrorList ? analyzer.getErrorList() : [];

    // 2. Formatear tokens
    const tokensFormatted = tokens.map(token => ({
        row: token.row,
        column: token.column,
        lexeme: token.lexeme,
        type: TokenType[token.type]
    }));

    // 3. Formatear errores léxicos
    const allLexErrors = lexErrors.map(err => ({
        row: err.row,
        column: err.column,
        lexeme: err.character,
        description: err.description
    }));

    // 4. Generar HTML directamente si no hay errores léxicos
    const html = lexErrors.length === 0 ? generarHTMLPensum(tokens) : "";

    // 5. Enviar respuesta
    res.json({
        tokens: tokensFormatted,
        lexErrors: allLexErrors,
        syntaxErrors: [], // Ya no se usa el parser
        html
    });
};
