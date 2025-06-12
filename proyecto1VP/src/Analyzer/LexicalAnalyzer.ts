import { Token, TokenType, LexError } from "./Tokens";

export class LexicalAnalyzer {
    private tokens: Token[] = [];
    private errors: LexError[] = [];

    scanner(input: string): Token[] {
        // Aquí irá tu AFD
        return this.tokens;
    }

    getErrorList(): LexError[] {
        return this.errors;
    }

    clear() {
        this.tokens = [];
        this.errors = [];
    }
}