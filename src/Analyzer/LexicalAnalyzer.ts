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
          if (char === '(') { this.state = 1; this.addCharacter(char); }
          else if (char === ')') { this.state = 2; this.addCharacter(char); }
          else if (char === ';') { this.state = 3; this.addCharacter(char); }
          else if (char === '=') { this.state = 4; this.addCharacter(char); }
          else if (char === ':') {
            if (input[i + 1] === '=') {
              this.state = 11; this.addCharacter(char);
            } else {
              this.state = 5; this.addCharacter(char);
            }
          }
          else if (char === ',') { this.state = 6; this.addCharacter(char); }
          else if (char === '"') { this.state = 7; this.addCharacter(char); }
          else if (char === '[') { this.state = 12; this.addCharacter(char); }
          else if (char === ']') { this.state = 13; this.addCharacter(char); }
          else if (char === '{') { this.state = 14; this.addCharacter(char); }
          else if (char === '}') { this.state = 15; this.addCharacter(char); }
          else if (/\d/.test(char)) { this.state = 8; this.addCharacter(char); }
          // Palabras reservadas y tipos
          else if (char === 'j') { this.state = 16; this.addCharacter(char); } // jugador
          else if (char === 'p') { this.state = 23; this.addCharacter(char); } // pokemon, planta, psiquico
          else if (char === 's') { this.state = 30; this.addCharacter(char); } // salud
          else if (char === 'a') { this.state = 35; this.addCharacter(char); } // ataque, agua
          else if (char === 'd') { this.state = 41; this.addCharacter(char); } // defensa, dragon
          else if (char === 'f') { this.state = 69; this.addCharacter(char); } // fuego
          else if (char === 'n') { this.state = 74; this.addCharacter(char); } // normal
          else if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) { this.state = 9; this.addCharacter(char); }
          else if (char === ' ' || char === '\t') { this.column += (char === '\t' ? 4 : 1); }
          else if (char === '\n' || char === '\r') { this.row++; this.column = 1; }
          else if (char === '#' && i === input.length - 1) { /* Fin del análisis */ }
          else { this.addError(Type.UNKNOW, char, this.row, this.column); this.column++; }
          break;

        case 1: this.addToken(Type.PAR_OPEN, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 2: this.addToken(Type.PAR_CLOSE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 3: this.addToken(Type.SEMICOLON, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 4: this.addToken(Type.EQUAL, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 5: this.addToken(Type.COLON, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 6: this.addToken(Type.COMMA, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 7: // Cadena de texto
          if (char === '"') { this.addCharacter(char); this.state = 10; }
          else if (char === '\n' || char === '\r' || char === '#') {
            this.addError(Type.UNKNOW, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
          } else { this.addCharacter(char); }
          break;
        case 8: // Número
          if (/\d/.test(char)) { this.addCharacter(char); }
          else { this.addToken(Type.NUMBER, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; }
          break;
        case 9: // Identificador general
          if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) { this.addCharacter(char); }
          else {
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
        case 10: this.addToken(Type.STRING, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 11: // :=
          if (input[i] === ':' && input[i + 1] === '=') { this.addCharacter('='); i++; }
          this.addToken(Type.ASSIGN, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); break;
        case 12: this.addToken(Type.BRACKET_OPEN, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 13: this.addToken(Type.BRACKET_CLOSE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 14: this.addToken(Type.BRACE_OPEN, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;
        case 15: this.addToken(Type.BRACE_CLOSE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--; break;

// --- jugador ---
        case 16: if (char === 'u') { this.state = 17; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 17: if (char === 'g') { this.state = 18; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 18: if (char === 'a') { this.state = 19; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 19: if (char === 'd') { this.state = 20; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 20: if (char === 'o') { this.state = 21; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 21: if (char === 'r') { this.state = 22; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 22: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
          this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
        } else { this.state = 9; this.addCharacter(char); } break;

        // --- pokemon ---
        case 23: if (char === 'o') { this.state = 24; this.addCharacter(char); }
          else if (char === 'l') { this.state = 44; this.addCharacter(char); }
          else if (char === 's') { this.state = 49; this.addCharacter(char); }
          else { this.state = 9; this.addCharacter(char); } break;
        case 24: if (char === 'k') { this.state = 25; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 25: if (char === 'e') { this.state = 26; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 26: if (char === 'm') { this.state = 27; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 27: if (char === 'o') { this.state = 28; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 28: if (char === 'n') { this.state = 29; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 29: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
          this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
        } else { this.state = 9; this.addCharacter(char); } break;

        // --- salud ---
        case 30: if (char === 'a') { this.state = 31; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 31: if (char === 'l') { this.state = 32; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 32: if (char === 'u') { this.state = 33; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 33: if (char === 'd') { this.state = 34; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 34: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
          this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
        } else { this.state = 9; this.addCharacter(char); } break;

        // --- ataque ---
        case 35: if (char === 't') { this.state = 36; this.addCharacter(char); }
          else if (char === 'g') { this.state = 56; this.addCharacter(char); }
          else { this.state = 9; this.addCharacter(char); } break;
        case 36: if (char === 'a') { this.state = 37; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 37: if (char === 'q') { this.state = 38; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 38: if (char === 'u') { this.state = 39; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 39: if (char === 'e') { this.state = 40; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 40: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
          this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
        } else { this.state = 9; this.addCharacter(char); } break;

        // --- defensa ---
        case 41: if (char === 'e') { this.state = 42; this.addCharacter(char); }
          else if (char === 'r') { this.state = 61; this.addCharacter(char); }
          else { this.state = 9; this.addCharacter(char); } break;
        case 42: if (char === 'f') { this.state = 43; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 43: if (char === 'e') { this.state = 44; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 44: if (char === 'n') { this.state = 45; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 45: if (char === 's') { this.state = 46; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 46: if (char === 'a') { this.state = 47; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 47: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
          this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
        } else { this.state = 9; this.addCharacter(char); } break;

        // --- planta ---
        case 48: if (char === 'a') { this.state = 49; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 49: if (char === 'n') { this.state = 50; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 50: if (char === 't') { this.state = 51; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 51: if (char === 'a') { this.state = 52; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 52: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
          this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
        } else { this.state = 9; this.addCharacter(char); } break;

        // --- psiquico ---
        case 53: if (char === 's') { this.state = 54; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 54: if (char === 'i') { this.state = 55; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 55: if (char === 'q') { this.state = 56; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 56: if (char === 'u') { this.state = 57; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 57: if (char === 'i') { this.state = 58; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 58: if (char === 'c') { this.state = 59; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
        case 59: if (char === 'o') {
  this.addCharacter(char);
  if (!((input[i + 1] >= 'a' && input[i + 1] <= 'z') || (input[i + 1] >= 'A' && input[i + 1] <= 'Z'))) {
    this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length + 1);
    this.clean();
  } else {
    this.state = 9;
  }
  break;
} else { this.state = 9; this.addCharacter(char); } break;

// --- agua ---
case 60: if (char === 'u') { this.state = 61; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 61: if (char === 'a') { this.state = 62; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 62: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
  this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
} else { this.state = 9; this.addCharacter(char); } break;

// --- dragon ---
case 63: if (char === 'a') { this.state = 64; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 64: if (char === 'g') { this.state = 65; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 65: if (char === 'o') { this.state = 66; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 66: if (char === 'n') { this.state = 67; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 67: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
  this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
} else { this.state = 9; this.addCharacter(char); } break;

// --- fuego ---
case 68: if (char === 'u') { this.state = 69; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 69: if (char === 'e') { this.state = 70; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 70: if (char === 'g') { this.state = 71; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 71: if (char === 'o') { this.state = 72; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 72: if (!((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z'))) {
  this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length); this.clean(); i--;
} else { this.state = 9; this.addCharacter(char); } break;

// --- normal ---
case 73: if (char === 'o') { this.state = 74; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 74: if (char === 'r') { this.state = 75; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 75: if (char === 'm') { this.state = 76; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 76: if (char === 'a') { this.state = 77; this.addCharacter(char); } else { this.state = 9; this.addCharacter(char); } break;
case 77: if (char === 'l') {
  this.addCharacter(char);
  if (!((input[i + 1] >= 'a' && input[i + 1] <= 'z') || (input[i + 1] >= 'A' && input[i + 1] <= 'Z'))) {
    this.addToken(Type.TYPE, this.auxChar, this.row, this.column - this.auxChar.length + 1);
    this.clean();
  } else {
    this.state = 9;
  }
  break;
} else { this.state = 9; this.addCharacter(char); } break;
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