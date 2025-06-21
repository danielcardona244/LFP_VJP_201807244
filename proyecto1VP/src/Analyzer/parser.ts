import { Token, TokenType, LexError } from "./Tokens";

export class SyntaxError {
    constructor(
        public row: number,
        public column: number,
        public lexeme: string,
        public description: string
    ) {}
}

export class Parser {
    private tokens: Token[];
    private position: number = 0;
    private errors: SyntaxError[] = [];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): boolean {
        this.position = 0;
        this.errors = [];

        // ✅ Permitir múltiples bloques de 'Carrera'
        while (this.position < this.tokens.length) {
            if (this.peekReserved("Carrera")) {
                this.parseCarrera();
            } else {
                const token = this.tokens[this.position];
                this.errors.push(new SyntaxError(token.row, token.column, token.lexeme, "Se esperaba 'Carrera'"));
                break;
            }
        }

        return this.errors.length === 0;
    }

    private match(type: TokenType, lexeme?: string): boolean {
        const token = this.tokens[this.position];
        if (token && token.type === type && (lexeme === undefined || token.lexeme === lexeme)) {
            this.position++;
            return true;
        }
        return false;
    }

    private expect(type: TokenType, lexeme?: string, description?: string): boolean {
        if (this.match(type, lexeme)) return true;
        const token = this.tokens[this.position] || this.tokens[this.tokens.length - 1];
        this.errors.push(new SyntaxError(
            token.row,
            token.column,
            token.lexeme,
            description || `Se esperaba ${TokenType[type]}${lexeme ? ` (${lexeme})` : ""}`
        ));
        return false;
    }

    private parseCarrera() {
        // Carrera: Nombre (varias palabras) {
        this.expect(TokenType.RESERVED_WORD, "Carrera", "Se esperaba 'Carrera'");
        this.expect(TokenType.SYMBOL, ":", "Se esperaba ':' después de 'Carrera'");
        this.parseNombreCarrera();
        this.expect(TokenType.SYMBOL, "[", "Se esperaba '[' para abrir el bloque de la carrera");
        while (this.peekReserved("Semestre")) {
            this.parseSemestre();
        }
        this.expect(TokenType.SYMBOL, "]", "Se esperaba ']' para cerrar el bloque de la carrera");
    }

    private parseNombreCarrera() {
        // Consume uno o más tokens STRING antes de la llave [
        let found = false;
        while (
            this.position < this.tokens.length &&
            (this.tokens[this.position].type === TokenType.STRING)
        ) {
            this.position++;
            found = true;
        }
        if (!found) {
            const token = this.tokens[this.position];
            this.errors.push(new SyntaxError(token.row, token.column, token.lexeme, "Se esperaba el nombre de la carrera"));
        }
    }

    private parseSemestre() {
        // Semestre: número {
        this.expect(TokenType.RESERVED_WORD, "Semestre", "Se esperaba 'Semestre'");
        this.expect(TokenType.SYMBOL, ":", "Se esperaba ':' después de 'Semestre'");
        this.expect(TokenType.NUMBER, undefined, "Se esperaba el número de semestre");
        this.expect(TokenType.SYMBOL, "{", "Se esperaba '{' para abrir el bloque del semestre");
        while (this.peekReserved("Curso")) {
            this.parseCurso();
        }
        this.expect(TokenType.SYMBOL, "}", "Se esperaba '}' para cerrar el bloque del semestre");
    }

    private parseCurso() {
        // Curso: número {
        this.expect(TokenType.RESERVED_WORD, "Curso", "Se esperaba 'Curso'");
        this.expect(TokenType.SYMBOL, ":", "Se esperaba ':' después de 'Curso'");
        this.expect(TokenType.NUMBER, undefined, "Se esperaba el código del curso");
        this.expect(TokenType.SYMBOL, "{", "Se esperaba '{' para abrir el bloque del curso");

        // Atributos del curso
        while (this.peekReserved("Nombre") || this.peekReserved("Area") || this.peekReserved("Prerrequisitos")) {
            this.parseAtributo();
        }

        this.expect(TokenType.SYMBOL, "}", "Se esperaba '}' para cerrar el bloque del curso");
    }

    private parseAtributo() {
        const token = this.tokens[this.position];
        switch (token.lexeme) {
            case "Nombre":
                this.expect(TokenType.RESERVED_WORD, "Nombre");
                this.expect(TokenType.SYMBOL, ":");
                this.expect(TokenType.STRING, undefined, "Se esperaba el nombre del curso");
                break;
            case "Area":
                this.expect(TokenType.RESERVED_WORD, "Area");
                this.expect(TokenType.SYMBOL, ":");
                this.expect(TokenType.NUMBER, undefined, "Se esperaba el código del área");
                break;
            case "Prerrequisitos":
                this.expect(TokenType.RESERVED_WORD, "Prerrequisitos");
                this.expect(TokenType.SYMBOL, ":");
                this.expect(TokenType.SYMBOL, "(", "Se esperaba '(' para abrir la lista de prerrequisitos");
                // Puede haber cero o más números separados por coma
                while (this.match(TokenType.NUMBER)) {
                    if (!this.match(TokenType.SYMBOL, ",")) break;
                }
                this.expect(TokenType.SYMBOL, ")", "Se esperaba ')' para cerrar la lista de prerrequisitos");
                break;
            default:
                this.errors.push(new SyntaxError(token.row, token.column, token.lexeme, "Atributo desconocido en curso"));
                this.position++;
        }
    }

    private peekReserved(word: string): boolean {
        const token = this.tokens[this.position];
        return token && token.type === TokenType.RESERVED_WORD && token.lexeme === word;
    }

    public getErrors(): SyntaxError[] {
        return this.errors;
    }
}
