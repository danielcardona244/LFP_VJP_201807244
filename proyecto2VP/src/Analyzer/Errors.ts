export interface AnalizadorError {
    row: number;
    column: number;
    lexeme: string;
    description: string;
}

export class ErrorReport {
    private errors: AnalizadorError[] = [];

    add(row: number, column: number, lexeme: string, description: string) {
        this.errors.push({ row, column, lexeme, description });
    }

    getAll(): AnalizadorError[] {
        return this.errors;
    }

    clear() {
        this.errors = [];
    }
}