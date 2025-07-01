import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { Parser } from "../Analyzer/parser";
import { translateTokens } from "../Analyzer/translator";
import { generateTokensHTML, generateErrorsHTML, generateSymbolTableHTML } from "../utils/htmlReports";

export const analyze = (req: Request, res: Response) => {
    const scanner = new LexicalAnalyzer();
    scanner.scanner(req.body);

    const tokens = scanner.getTokenList().map(token => ({
        row: token.row,
        column: token.column,
        lexeme: token.lexeme,
        type: token.typeTokenString
    }));

    const lexicalErrors = scanner.getErrorReport();

    if (lexicalErrors.length === 0) {
        const parser = new Parser(scanner.getTokenList());
        parser.parse();
        const syntaxErrors = parser.getErrorReport();
        const symbolTable = parser.getSymbolTable();

        let translation = "";
        if (syntaxErrors.length === 0) {
            translation = translateTokens(scanner.getTokenList());
        }

        // Generar HTMLs
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
    } else {
        const tokensHTML = generateTokensHTML(tokens);
        const lexicalErrorsHTML = generateErrorsHTML(lexicalErrors);
        res.json({
            tokens,
            lexicalErrors,
            tokensHTML,
            lexicalErrorsHTML
        });
    }
};