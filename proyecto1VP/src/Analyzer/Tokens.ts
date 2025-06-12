export enum TokenType {
    RESERVED,    // Palabra reservada
    STRING,      // Cadena de texto
    NUMBER,      // Número entero
    SYMBOL       // Símbolo especial
}

export class Token {
    constructor(
        public type: TokenType,
        public lexeme: string,
        public row: number,
        public column: number
    ) {}
}

export class LexError {
    constructor(
        public row: number,
        public column: number,
        public character: string,
        public description: string
    ) {}
}