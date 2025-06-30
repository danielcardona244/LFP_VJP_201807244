import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { Parser } from "../Analyzer/parser"; // Para el futuro
// import { translateTokens } from "../Analyzer/translator"; // Para el futuro

export const analyze = (req: Request, res: Response) => {
    const scanner = new LexicalAnalyzer();
    scanner.scanner(req.body);

    // Preparar tokens y errores para la respuesta (formato tabla)
    const tokens = scanner.getTokenList().map(token => ({
        row: (token as any).row,
        column: (token as any).column,
        lexeme: (token as any).lexeme,
        type: (token as any).typeTokenString
    }));

    const errors = scanner.getErrorList().map(error => ({
        row: (error as any).row,
        column: (error as any).column,
        lexeme: (error as any).lexeme,
        description: "Carácter no reconocido"
    }));

    // Aquí puedes agregar análisis sintáctico y traducción en el futuro

    // Después de obtener los tokens y errores léxicos:
    if (errors.length === 0) {
        // Solo si no hay errores léxicos, continúa con el parser
        const parser = new Parser(scanner.getTokenList());
        const isValid = parser.parse();
        const syntaxErrors = parser.getErrors();

        res.json({
            tokens,
            errors,
            syntaxErrors,
            isValid
        });
    } else {
        // Si hay errores léxicos, solo muestra esos
        res.json({
            tokens,
            errors
        });
    }
};