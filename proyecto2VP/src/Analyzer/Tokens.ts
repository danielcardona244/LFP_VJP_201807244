export enum Type {
    UNKOWN,
    COMMENT,
    COMMENT_BLOCK,
    DIVISION,

    // Simbología general
    KEY_O,     // {
    KEY_C,     // }
    BRA_O,     // [
    BRA_C,     // ]
    PAR_O,     // (
    PAR_C,     // )
    SEMICOLON, // ;
    COMMA,     // ,
    PERIOD,    // .
    ASSIGN,    // =
    PLUS,      // +
    MINUS,     // -
    MULT,      // *
    DIV,       // /
    INC,       // ++
    DEC,       // --
    EQUAL,     // ==
    DIFF,      // !=
    LESS,      // <
    GREATER,   // >
    LESS_EQ,   // <=
    GREATER_EQ,// >=

    // Literales
    IDENTIFIER,
    INTEGER,
    DECIMAL,
    STRING,
    CHAR,

    // Palabras reservadas
    R_USING,
    R_SYSTEM,
    R_PUBLIC,
    R_CLASS,
    R_STATIC,
    R_VOID,
    R_MAIN,
    R_STRING,
    R_INT,
    R_FLOAT,
    R_CHAR,
    R_BOOL,
    R_FALSE,
    R_TRUE,
    R_CONSOLE,
    R_WRITELINE,
    R_IF,
    R_ELSE,
    R_FOR,
    AND,    // &&
    OR      // ||
}

export class Token {

    public typeToken: Type;
    public lexeme: string;
    public row: number;
    public column: number;
    public typeTokenString: string;

    constructor(typeToken: Type, lexeme: string, row: number, column: number) {
        this.typeToken = typeToken;
        this.typeTokenString = Type[typeToken];
        this.lexeme = lexeme;
        this.row = row;
        this.column = column;
    }
}

