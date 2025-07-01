export interface SymbolInfo {
    name: string;
    type: string;
    value: string | number | boolean | null;
    row: number;
    column: number;
}

export class SymbolTable {
    private symbols: SymbolInfo[] = [];

    add(symbol: SymbolInfo) {
        this.symbols.push(symbol);
    }

    getAll(): SymbolInfo[] {
        return this.symbols;
    }

    clear() {
        this.symbols = [];
    }
}