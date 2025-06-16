import { Token, TokenType, LexError } from "./Tokens";

const RESERVED_WORDS = [
  "Carrera", "Semestre", "Curso", "Codigo", "Nombre", "Creditos", "Prerrequisitos"
];
const SYMBOLS = [":", "{", "}", "[", "]", ","];

export class LexicalAnalyzer {
    private tokens: Token[] = [];
    private errors: LexError[] = [];

    scanner(input: string): Token[] {
        this.clear();
        let row = 1, col = 1;

        // Expresión regular para encontrar todos los tokens posibles
        // 1. Cadenas entre comillas
        // 2. Palabras (reservadas o identificadores)
        // 3. Números
        // 4. Símbolos
        // 5. Caracteres desconocidos
        const regex = /"([^"\n\r]*)"|[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+|\d+|[:{}\[\],]|[^\s]/g;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(input)) !== null) {
            const lexeme = match[0];
            // Calcular fila y columna
            const before = input.slice(0, match.index);
            row = before.split('\n').length;
            const lastLine = before.lastIndexOf('\n');
            col = match.index - lastLine;

            if (/^"([^"\n\r]*)"$/.test(lexeme)) {
                // Cadena entre comillas
                this.tokens.push(new Token(TokenType.STRING, lexeme, row, col));
            } else if (RESERVED_WORDS.includes(lexeme)) {
                this.tokens.push(new Token(TokenType.RESERVED_WORD, lexeme, row, col));
            } else if (/^\d+$/.test(lexeme)) {
                this.tokens.push(new Token(TokenType.NUMBER, lexeme, row, col));
            } else if (SYMBOLS.includes(lexeme)) {
                this.tokens.push(new Token(TokenType.SYMBOL, lexeme, row, col));
            } else if (/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+$/.test(lexeme)) {
                // Identificador (no reservado)
                this.tokens.push(new Token(TokenType.STRING, lexeme, row, col));
            } else {
                // Caracter desconocido
                this.errors.push(new LexError(row, col, lexeme, "Carácter desconocido"));
            }
        }

        // 🚫 Se eliminó la detección extra de comillas sin cerrar para evitar errores falsos

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
