export enum Type {
  PAR_OPEN,        // 0  (
  PAR_CLOSE,       // 1  )
  SEMICOLON,       // 2  ;
  EQUAL,           // 3  =
  RESERVED_WORD,   // 4
  TYPE,            // 5
  NUMBER,          // 6
  STRING,          // 7
  ID,              // 8
  COLON,           // 9  :
  COMMA,           // 10 ,
  ASSIGN,          // 11 :=
  BRACKET_OPEN,    // 12 [
  BRACKET_CLOSE,   // 13 ]
  BRACE_OPEN,      // 14 {
  BRACE_CLOSE,     // 15 }
  UNKNOW           // 16
}

export class Token {
  constructor(
    public tipo: Type,
    public lexema: string,
    public fila: number,
    public columna: number,
    public descripcion?: string // <-- Nuevo parámetro opcional
  ) {}
}