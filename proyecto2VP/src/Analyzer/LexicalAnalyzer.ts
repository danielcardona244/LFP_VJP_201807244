import { get } from 'http';
import { Token, Type } from './Tokens';

export class LexicalAnalyzer {

    private row: number;
    private column: number;
    private state: number;
    private auxChar: string;
    private tokenList: Token[];
    private errorList: Token[];

    constructor() {
        this.row = 1;
        this.column = 1;
        this.state = 0;
        this.auxChar = '';
        this.tokenList = [];
        this.errorList = [];
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
                            break
                        case '\t':
                            this.column += 4; // 4 espacios por tabulación
                            break;
                        default:
                            if (char == '#' && i == input.length - 1) {
                                //analisis finalizado
                                console.log("Análisis finalizado");
                            }else {
                                //error lexico
                                this.adderror(Type.UNKOWN, char, this.row, this.column - 1);
                            }
                    }  
                    break;
                case 1:
                    //aceptacion
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
                    //aceptacion
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
                    this.state = 3; // Volver al estado de comentario bloque
                    i--; // para no perder el caracter actual
                    break;
                case 5:
                    //aceptacion
                    this.addToken(Type.COMMENT_BLOCK, this.auxChar, this.row, this.column);
                    this.clean();
                    i--; 
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
        this.errorList.push(new Token(type, lexeme, row, column));
    }

    getTokenList() {
        return this.tokenList;
    }

    getErrorList() {
        return this.errorList;
    }
    
}
