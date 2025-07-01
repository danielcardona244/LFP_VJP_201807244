import { Token, Type } from './Tokens';
import { ErrorReport } from "./Errors";

type ReservedWord = {
    lexeme: string;
    token: Type;
};

export class LexicalAnalyzer {
    private row: number;
    private column: number;
    private state: number;
    private auxChar: string;
    private tokenList: Token[];
    private reservedWords: ReservedWord[];
    private errorReport = new ErrorReport();

    constructor() {
        this.row = 1;
        this.column = 1;
        this.state = 0;
        this.auxChar = '';
        this.tokenList = [];
        this.reservedWords = [
            { lexeme: 'using', token: Type.R_USING },
            { lexeme: 'System', token: Type.R_SYSTEM },
            { lexeme: 'public', token: Type.R_PUBLIC },
            { lexeme: 'class', token: Type.R_CLASS },
            { lexeme: 'static', token: Type.R_STATIC },
            { lexeme: 'void', token: Type.R_VOID },
            { lexeme: 'Main', token: Type.R_MAIN },
            { lexeme: 'string', token: Type.R_STRING },
            { lexeme: 'int', token: Type.R_INT },
            { lexeme: 'float', token: Type.R_FLOAT },
            { lexeme: 'char', token: Type.R_CHAR },
            { lexeme: 'bool', token: Type.R_BOOL },
            { lexeme: 'false', token: Type.R_FALSE },
            { lexeme: 'true', token: Type.R_TRUE },
            { lexeme: 'Console', token: Type.R_CONSOLE },
            { lexeme: 'WriteLine', token: Type.R_WRITELINE },
            { lexeme: 'if', token: Type.R_IF },
            { lexeme: 'else', token: Type.R_ELSE },
            { lexeme: 'for', token: Type.R_FOR }
        ];
    }
    private isLetter(char: string): boolean {
        return /^[a-zA-Z]$/.test(char);
    }
    private isDigit(char: string): boolean {
        return /^[0-9]$/.test(char);
    }
    scanner(input: string) { 

        input += "#";

        let char: string = '';

        for (let i = 0; i < input.length; i++) {
            char = input[i];

            switch (this.state) {
                case 0:
                    switch (char) {
                        case '/':
                            this.addCharacter(char);
                            this.state = 1;
                            break;
                        case ' ':
                            this.column++;
                            break;
                        case '\n':
                        case '\r':
                            this.row++;
                            this.column = 1;
                            break;
                        case '\t':
                            this.column += 4;
                            break;
                        case '{':
                            this.addToken(Type.KEY_O, char, this.row, this.column);
                            this.column++;
                            break;
                        case '}':
                            this.addToken(Type.KEY_C, char, this.row, this.column);
                            this.column++;
                            break;
                        case '[':
                            this.addToken(Type.BRA_O, char, this.row, this.column);
                            this.column++;
                            break;
                        case ']':
                            this.addToken(Type.BRA_C, char, this.row, this.column);
                            this.column++;
                            break;
                        case '(':
                            this.addToken(Type.PAR_O, char, this.row, this.column);
                            this.column++;
                            break;
                        case ')':
                            this.addToken(Type.PAR_C, char, this.row, this.column);
                            this.column++;
                            break;
                        case ';':
                            this.addToken(Type.SEMICOLON, char, this.row, this.column);
                            this.column++;
                            break;
                        case ',':
                            this.addToken(Type.COMMA, char, this.row, this.column);
                            this.column++;
                            break;
                        case '.':
                            this.addToken(Type.PERIOD, char, this.row, this.column);
                            this.column++;
                            break;
                        case '=':
                            this.addCharacter(char);
                            this.state = 6; // posible == o =
                            break;
                        case '+':
                            this.addCharacter(char);
                            this.state = 7; // posible ++ o +
                            break;
                        case '-':
                            this.addCharacter(char);
                            this.state = 8; // posible -- o -
                            break;
                        case '*':
                            this.addToken(Type.MULT, char, this.row, this.column);
                            this.column++;
                            break;
                        case '!':
                            this.addCharacter(char);
                            this.state = 9; // posible != o !
                            break;
                        case '<':
                            this.addCharacter(char);
                            this.state = 10; // posible < o <=
                            break;
                        case '>':
                            this.addCharacter(char);
                            this.state = 11; // posible > o >=
                            break;
                        case '"':
                            this.addCharacter(char);
                            this.state = 12; // cadena
                            break;
                        case '\'':
                            this.addCharacter(char);
                            this.state = 13; // caracter
                            break;
                        case '&':
                            this.addCharacter(char);
                            this.state = 16; // posible &&
                            break;
                        case '|':
                            this.addCharacter(char);
                            this.state = 17; // posible ||
                            break;
                        default:
                            if (this.isLetter(char) || char === '_') {
                                this.addCharacter(char);
                                this.state = 14; // identificador o palabra reservada
                            } else if (this.isDigit(char)) {
                                this.addCharacter(char);
                                this.state = 15; // número entero o decimal
                            } else if (char == '#' && i == input.length - 1) {
                                // análisis finalizado
                            } else {
                                this.adderror(Type.UNKOWN, char, this.row, this.column);
                                this.column++;
                            }
                    }
                    break;
                // Comentarios y división ya implementados (estados 1-5)
                case 1:
                    if (char == '/') {
                        this.addCharacter(char);
                        this.state = 2;
                        continue;
                    }
                    if (char == '*') {
                        this.addCharacter(char);
                        this.state = 3;
                        continue;
                    }
                    this.addToken(Type.DIVISION, this.auxChar, this.row, this.column - this.auxChar.length);
                    this.clean();
                    i--;
                    break;
                case 2:
                    if (char == '\n'){
                        this.addToken(Type.COMMENT, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--;
                        continue;                  
                    }   
                    if (char == '#' && i == input.length - 1) {
                        this.addToken(Type.COMMENT, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        continue; 
                    }
                    this.addCharacter(char);
                    break;
                case 3:
                    if (char == '*') {
                        this.addCharacter(char);
                        this.state = 4;
                        continue;
                    }
                    if (char == '\n'){
                        this.row++;
                        this.column = 0;
                    }
                    this.addCharacter(char);
                    break;
                case 4:
                    if (char == '/') {
                        this.addCharacter(char);
                        this.state = 5;
                        continue;
                    }
                    this.state = 3;
                    i--;
                    break;
                case 5:
                    this.addToken(Type.COMMENT_BLOCK, this.auxChar, this.row, this.column);
                    this.clean();
                    i--; 
                    break;
                // == o =
                case 6:
                    if (char == '=') {
                        this.addCharacter(char);
                        this.addToken(Type.EQUAL, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.addToken(Type.ASSIGN, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // ++ o +
                case 7:
                    if (char == '+') {
                        this.addCharacter(char);
                        this.addToken(Type.INC, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.addToken(Type.PLUS, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // -- o -
                case 8:
                    if (char == '-') {
                        this.addCharacter(char);
                        this.addToken(Type.DEC, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.addToken(Type.MINUS, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // != o !
                case 9:
                    if (char == '=') {
                        this.addCharacter(char);
                        this.addToken(Type.DIFF, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.adderror(Type.UNKOWN, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // < o <=
                case 10:
                    if (char == '=') {
                        this.addCharacter(char);
                        this.addToken(Type.LESS_EQ, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.addToken(Type.LESS, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // > o >=
                case 11:
                    if (char == '=') {
                        this.addCharacter(char);
                        this.addToken(Type.GREATER_EQ, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.addToken(Type.GREATER, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // Cadena de texto
                case 12:
                    if (char === '"' && this.auxChar.length > 1) {
                        this.addCharacter(char);
                        this.addToken(Type.STRING, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        this.clean();
                    } else if (char === '\n' || char === '#') {
                        this.adderror(Type.UNKOWN, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        this.clean();
                        i--;
                    } else {
                        this.addCharacter(char);
                    }
                    break;
                // Caracter
                case 13:
                    if (char === '\'' && this.auxChar.length > 1) {
                        this.addCharacter(char);
                        this.addToken(Type.CHAR, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        this.clean();
                    } else if (char === '\n' || char === '#') {
                        this.adderror(Type.UNKOWN, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        this.clean();
                        i--;
                    } else {
                        this.addCharacter(char);
                    }
                    break;
                // Identificador o palabra reservada
                case 14:
                    if (this.isLetter(char) || this.isDigit(char) || char === '_') {
                        this.addCharacter(char);
                    } else {
                        // Verificar si es palabra reservada
                        const reserved = this.reservedWords.find(rw => rw.lexeme === this.auxChar);
                        if (reserved) {
                            this.addToken(reserved.token, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        } else {
                            this.addToken(Type.IDENTIFIER, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        }
                        this.clean();
                        i--;
                    }
                    break;
                // Número entero o decimal
                case 15:
                    if (this.isDigit(char)) {
                        this.addCharacter(char);
                    } else if (char === '.' && !this.auxChar.includes('.')) {
                        this.addCharacter(char);
                    } else {
                        if (this.auxChar.includes('.')) {
                            this.addToken(Type.DECIMAL, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        } else {
                            this.addToken(Type.INTEGER, this.auxChar, this.row, this.column - this.auxChar.length + 1);
                        }
                        this.clean();
                        i--;
                    }
                    break;
                // &&
                case 16:
                    if (char == '&') {
                        this.addCharacter(char);
                        this.addToken(Type.AND, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.adderror(Type.UNKOWN, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
                // ||
                case 17:
                    if (char == '|') {
                        this.addCharacter(char);
                        this.addToken(Type.OR, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        this.column++;
                    } else {
                        this.adderror(Type.UNKOWN, this.auxChar, this.row, this.column - 1);
                        this.clean();
                        i--;
                    }
                    break;
            }           
        }
    }


    clean() {
        this.state = 0;
        this.auxChar = '';
    }

    addCharacter(char: string){
        this.auxChar += char;
        this.column++;
    }


    addToken(type: Type, lexeme: string, row: number, column: number) {
        this.tokenList.push(new Token(type, lexeme, row, column));
        
    }

    adderror(type: Type, lexeme: string, row: number, column: number) {
        this.errorReport.add(row, column, lexeme, "Carácter no reconocido");
    }

    getTokenList() {
        return this.tokenList;
    }

    getErrorReport() {
        return this.errorReport.getAll();
    }
    
}
