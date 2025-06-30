import { Token, Type } from "./Tokens";


export class Parser {
    private tokens: Token[];
    private position: number = 0;
    private errors: { row: number, column: number, lexeme: string, description: string }[] = [];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    
    }

    public parse(): boolean {
        // Aquí inicia el análisis sintáctico
        // Ejemplo: return this.program();
        return this.program();
    }

    // Ejemplo de función para la producción inicial
    private program(): boolean {
        // Ejemplo: <program> ::= <using> <class_decl>
        // Implementa la lógica de tu gramática aquí
        // Si hay error, agrega a this.errors
        return true;
    }

    // Métodos auxiliares
    private match(expected: Type): boolean {
        if (this.tokens[this.position]?.typeToken === expected) {
            this.position++;
            return true;
        } else {
            // Agrega error sintáctico
            const token = this.tokens[this.position];
            this.errors.push({
                row: token?.row ?? 0,
                column: token?.column ?? 0,
                lexeme: token?.lexeme ?? "",
                description: `Se esperaba ${Type[expected]}`
            });
            return false;
        }
    }

    public getErrors() {
        return this.errors;
    }
}