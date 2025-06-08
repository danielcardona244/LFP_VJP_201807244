import { Token, Type } from "./Token";

const RESERVED_WORDS = [
  "jugador", "pokemon", "salud", "ataque", "defensa"
];
const TYPES = [
  "agua", "dragon", "planta", "psiquico", "fuego", "normal"
];

class LexicalAnalyzer {
  private row: number;
  private column: number;
  private auxChar: string;
  private state: number;
  private tokenList: Token[];
  private errorList: Token[];

  constructor() {
    this.row = 1;
    this.column = 1;
    this.auxChar = '';
    this.state = 0;
    this.tokenList = [];
    this.errorList = [];
  }

  scanner(input: string) {
    input += '#';
    let char: string;

    for (let i = 0; i < input.length; i++) {
      char = input[i];

      switch (this.state) {
        case 0:
          if (char === '(') {
            this.state = 1; this.addCharacter(char);
          } else if (char === ')') {
            this.state = 2; this.addCharacter(char);
          } else if (char === ';') {
            this.state = 3; this.addCharacter(char);
          } else if (char === '=') {
            this.state = 4; this.addCharacter(char);
          } else if (char === ':') {
            // Detectar :=
            if (input[i + 1] === '=') {
              this.state = 11; // Nuevo estado para:=
              this.addCharacter(char);
            } else {
              this.state = 5; this.addCharacter(char);
            }
          } else if (char === ',') {
            this.state = 6; this.addCharacter(char);
          } else if (char === '"') {
            this.state = 7; this.addCharacter(char);
          } else if (char === '[') {
            this.state = 12; this.addCharacter(char);
          } else if (char === ']') {
            this.state = 13; this.addCharacter(char);
          } else if (char === '{') {
            this.state = 14; this.addCharacter(char);
          } else if (char === '}') {
            this.state = 15; this.addCharacter(char);
          } else if (/\d/.test(char)) {
            this.state = 8; this.addCharacter(char);
          } else if (/[a-zA-Z]/.test(char)) {
            this.state = 9; this.addCharacter(char);
          } else if (char === ' ' || char === '\t') {
            this.column += (char === '\t' ? 4 : 1);
          } else if (char === '\n' || char === '\r') {
            this.row++; this.column = 1;
          } else if (char === '#' && i === input.length - 1) {
            // Fin del análisis
          } else {
            this.addError(Type.UNKNOW, char, this.row, this.column);
            this.column++;
          }
          break;

        case 1: // (
          this.addToken(Type.PAR_OPEN, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 2: // )
          this.addToken(Type.PAR_CLOSE, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 3: // ;
          this.addToken(Type.SEMICOLON, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 4: // =
          this.addToken(Type.EQUAL, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 5: // :
          this.addToken(Type.COLON, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 6: // ,
          this.addToken(Type.COMMA, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 7: // Cadena de texto
          if (char === '"') {
            this.addCharacter(char);
            this.state = 10;
          } else if (char === '\n' || char === '\r' || char === '#') {
            this.addError(Type.UNKNOW, this.auxChar, this.row, this.column - this.auxChar.length);
            this.clean(); i--;
          } else {
            this.addCharacter(char);
          }
          break;
        case 8: // Número
          if (/\d/.test(char)) {
            this.addCharacter(char);
          } else {
            this.addToken(Type.NUMBER, this.auxChar, this.row, this.column - this.auxChar.length);
            this.clean(); i--;
          }
          break;
        case 9: // Palabra (reservada, tipo o identificador)
          if (/[a-zA-Z]/.test(char)) {
            this.addCharacter(char);
          } else {
            const lex = this.auxChar.toLowerCase();
            if (RESERVED_WORDS.includes(lex)) {
              this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length);
            } else if (TYPES.includes(lex)) {
              this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length);
            } else {
              this.addToken(Type.ID, this.auxChar, this.row, this.column - this.auxChar.length);
            }
            this.clean(); i--;
          }
          break;
        case 10: // Fin de cadena de texto
          this.addToken(Type.STRING, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 11: // :=
          if (input[i] === ':' && input[i + 1] === '=') {
            this.addCharacter('='); // ya agregaste ':', ahora '='
            i++; // saltar '='
          }
          this.addToken(Type.ASSIGN, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean();
          break;
        case 12: // [
          this.addToken(Type.BRACKET_OPEN, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 13: // ]
          this.addToken(Type.BRACKET_CLOSE, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 14: // {
          this.addToken(Type.BRACE_OPEN, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
        case 15: // }
          this.addToken(Type.BRACE_CLOSE, this.auxChar, this.row, this.column - this.auxChar.length);
          this.clean(); i--;
          break;
      }
    }
    return this.tokenList;
  }

  private addCharacter(char: string) {
    this.auxChar += char;
    this.column++;
  }

  private clean() {
    this.state = 0;
    this.auxChar = '';
  }

  private addToken(type: Type, lexeme: string, row: number, column: number) {
    this.tokenList.push(new Token(type, lexeme, row, column));
  }

  private addError(type: Type, lexeme: string, row: number, column: number, descripcion?: string) {
    this.errorList.push(new Token(type, lexeme, row, column, descripcion));
  }

  getErrorList() {
    return this.errorList;
  }
}

export { LexicalAnalyzer };