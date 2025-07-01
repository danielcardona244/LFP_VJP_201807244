import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { Parser } from "../Analyzer/parser";
import { translateTokens } from "../Analyzer/translator";
import { generateTokensHTML, generateErrorsHTML, generateSymbolTableHTML } from "../utils/htmlReports";

export const analyze = (req: Request, res: Response): void => {
    const scanner = new LexicalAnalyzer();
    scanner.scanner(req.body);

    const rawTokens = scanner.getTokenList();
    const lexicalErrors = scanner.getErrorReport();

    // Mapeo para mostrar en tabla
    const tokens = rawTokens.map(token => ({
        row: token.row,
        column: token.column,
        lexeme: token.lexeme,
        type: token.typeTokenString
    }));

    // Ejecutar análisis sintáctico siempre, aunque haya errores léxicos
    const parser = new Parser(rawTokens);
    parser.parse();

    const syntaxErrors = parser.getErrorReport();
    const symbolTable = parser.getSymbolTable();

    // Solo si no hay errores, traducir
    let translation = "";
    if (lexicalErrors.length === 0 && syntaxErrors.length === 0) {
        translation = translateTokens(rawTokens);
    }

    // Generar HTMLs para los reportes
    const tokensHTML = generateTokensHTML(tokens);
    const lexicalErrorsHTML = generateErrorsHTML(lexicalErrors);
    const syntaxErrorsHTML = generateErrorsHTML(syntaxErrors);
    const symbolTableHTML = generateSymbolTableHTML(symbolTable);

    res.json({
        tokens,
        lexicalErrors,
        syntaxErrors,
        translation,
        symbolTable,
        tokensHTML,
        lexicalErrorsHTML,
        syntaxErrorsHTML,
        symbolTableHTML
    });
};
