import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { Parser } from "../Analyzer/parser";
import { generarHTMLPensum } from "../Generator/htmlGenerator";
import { TokenType } from "../Analyzer/Tokens";

export const analyzeText = (req: Request, res: Response): void => {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
        res.status(400).json({
            tokens: [],
            lexErrors: [],
            syntaxErrors: [
                {
                    row: 0,
                    column: 0,
                    lexeme: "",
                    description: "No se recibió texto para analizar."
                }
            ],
            html: ""
        });
        return;
    }

    // 1. Análisis léxico
    const analyzer = new LexicalAnalyzer();
    const tokens = analyzer.scanner(input);
    const lexErrors = analyzer.getErrorList ? analyzer.getErrorList() : [];

    // 2. Análisis sintáctico
    const parser = new Parser(tokens);
    parser.parse();
    const syntaxErrors = parser.getErrors();

    // 3. Formatear tokens (convertir tipo numérico a nombre del token)
    const tokensFormatted = tokens.map(token => ({
        row: token.row,
        column: token.column,
        lexeme: token.lexeme,
        type: TokenType[token.type]
    }));

    // 4. Formatear errores
    const allLexErrors = lexErrors.map(err => ({
        row: err.row,
        column: err.column,
        lexeme: err.character, 
        description: err.description
    }));

    const allSyntaxErrors = syntaxErrors.map(err => ({
        row: err.row,
        column: err.column,
        lexeme: err.lexeme,
        description: err.description
    }));

    // 5. Generar HTML si no hay errores de sintaxis
    const html = syntaxErrors.length === 0 ? generarHTMLPensum(tokens) : "";

    // 6. Enviar respuesta
    res.json({
        tokens: tokensFormatted,
        lexErrors: allLexErrors,
        syntaxErrors: allSyntaxErrors,
        html
    });
};
