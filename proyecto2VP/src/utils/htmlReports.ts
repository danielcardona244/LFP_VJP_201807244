import { AnalizadorError } from "../Analyzer/Errors";
import { SymbolInfo } from "../Analyzer/SymbolTable";

export function generateTokensHTML(tokens: { row: number, column: number, lexeme: string, type: string }[]): string {
    let html = `<table border="1"><tr><th>Fila</th><th>Columna</th><th>Lexema</th><th>Tipo</th></tr>`;
    for (const t of tokens) {
        html += `<tr><td>${t.row}</td><td>${t.column}</td><td>${t.lexeme}</td><td>${t.type}</td></tr>`;
    }
    html += `</table>`;
    return html;
}

export function generateErrorsHTML(errors: AnalizadorError[]): string {
    let html = `<table border="1"><tr><th>Fila</th><th>Columna</th><th>Lexema</th><th>Descripción</th></tr>`;
    for (const e of errors) {
        html += `<tr><td>${e.row}</td><td>${e.column}</td><td>${e.lexeme}</td><td>${e.description}</td></tr>`;
    }
    html += `</table>`;
    return html;
}

export function generateSymbolTableHTML(symbols: SymbolInfo[]): string {
    let html = `<table border="1"><tr><th>Variable</th><th>Tipo</th><th>Valor</th><th>Fila</th><th>Columna</th></tr>`;
    for (const s of symbols) {
        html += `<tr><td>${s.name}</td><td>${s.type}</td><td>${s.value ?? ""}</td><td>${s.row}</td><td>${s.column}</td></tr>`;
    }
    html += `</table>`;
    return html;
}