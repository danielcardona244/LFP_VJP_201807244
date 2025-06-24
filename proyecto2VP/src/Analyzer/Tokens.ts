export enum Type {
    UNKOWN,
    COMMENT,
    COMMENT_BLOCK,
    DIVISION,
}

export class Token {

    private typeToken: Type;
    private lexeme: string;
    private row: number;
    private column: number;
    private typeTokenString: string;

    constructor(typeToken: Type, lexeme: string, row: number, column: number) {
        this.typeToken = typeToken;
        this.typeTokenString = Type[typeToken];
        this.lexeme = lexeme;
        this.row = row;
        this.column = column;
        
    }
}
    
    