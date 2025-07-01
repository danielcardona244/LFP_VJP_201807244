import { Token, Type } from "./Tokens";
import { ErrorReport } from "./Errors";
import { SymbolTable } from "./SymbolTable";

type Production =
    | "INSTRUCTION"
    | "LIST_INSTRUCTIONS_P"
    | "ID_ASIGN_P"
    | "LIST_ID_P"
    | "INST_IF_P"
    | "FIRST_BLOCK_FOR"
    | "THIRD_BLOCK_FOR_P"
    | "ARITHMETIC"
    | "ARITHMETIC_P"
    | "RELATIONAL"
    | "TERM_P"
    | "FACTOR";

type First = { production: Production; first: Type[] };

export class Parser {
    private tokens: Token[];
    private pos: number;
    private flagError: boolean;
    private preAnalysis: Token;
    private firsts: First[];
    private errorReport = new ErrorReport();
    private symbolTable = new SymbolTable();

    constructor(tokens: Token[]) {
        this.pos = 0;
        this.tokens = tokens;
        this.flagError = false;
        this.firsts = [
            { production: "INSTRUCTION", first: [Type.R_INT, Type.R_FLOAT, Type.R_BOOL, Type.R_STRING, Type.R_CHAR, Type.IDENTIFIER, Type.R_CONSOLE, Type.R_IF, Type.R_FOR] },
            { production: "LIST_INSTRUCTIONS_P", first: [Type.R_INT, Type.R_FLOAT, Type.R_BOOL, Type.R_STRING, Type.R_CHAR, Type.IDENTIFIER, Type.R_CONSOLE, Type.R_IF, Type.R_FOR] },
            { production: "ID_ASIGN_P", first: [Type.ASSIGN] },
            { production: "LIST_ID_P", first: [Type.COMMA] },
            { production: "INST_IF_P", first: [Type.R_ELSE] },
            { production: "FIRST_BLOCK_FOR", first: [Type.R_INT, Type.R_FLOAT, Type.R_BOOL, Type.R_STRING, Type.R_CHAR, Type.IDENTIFIER] },
            { production: "THIRD_BLOCK_FOR_P", first: [Type.INC, Type.DEC] },
            { production: "ARITHMETIC", first: [Type.PAR_O, Type.IDENTIFIER, Type.INTEGER, Type.DECIMAL, Type.STRING, Type.CHAR, Type.R_FALSE, Type.R_TRUE] },
            { production: "ARITHMETIC_P", first: [Type.PLUS, Type.MINUS] },
            { production: "RELATIONAL", first: [Type.EQUAL, Type.DIFF, Type.LESS, Type.LESS_EQ, Type.GREATER, Type.GREATER_EQ] },
            { production: "TERM_P", first: [Type.MULT, Type.DIVISION] },
            { production: "FACTOR", first: [Type.PAR_O, Type.IDENTIFIER, Type.INTEGER, Type.DECIMAL, Type.STRING, Type.CHAR, Type.R_FALSE, Type.R_TRUE] }
        ];
        this.preAnalysis = this.tokens[this.pos];
    }

    public parse() {
        this.blockUsing();
        this.classDecl();
    }

    private blockUsing() {
        this.expect(Type.R_USING);
        this.expect(Type.R_SYSTEM);
        this.expect(Type.SEMICOLON);
    }

    private classDecl() {
        this.expect(Type.R_PUBLIC);
        this.expect(Type.R_CLASS);
        this.expect(Type.IDENTIFIER);
        this.expect(Type.KEY_O);
        this.blockMain();
        this.expect(Type.KEY_C);
    }

    private blockMain() {
        this.expect(Type.R_STATIC);
        this.expect(Type.R_VOID);
        this.expect(Type.R_MAIN);
        this.expect(Type.PAR_O);
        this.expect(Type.R_STRING);
        this.expect(Type.BRA_O);
        this.expect(Type.BRA_C);
        this.expect(Type.IDENTIFIER);
        this.expect(Type.PAR_C);
        this.expect(Type.KEY_O);
        this.listInstructions();
        this.expect(Type.KEY_C);
    }

    private listInstructions() {
        this.instruction();
        this.listInstructionsP();
    }

    private listInstructionsP() {
        if (this.isFirst("LIST_INSTRUCTIONS_P")) {
            this.instruction();
            this.listInstructionsP();
        }
    }

    private instruction() {
        switch (this.preAnalysis.typeToken) {
            case Type.R_INT:
            case Type.R_STRING:
            case Type.R_FLOAT:
            case Type.R_BOOL:
            case Type.R_CHAR:
                this.declaration();
                break;
            case Type.IDENTIFIER:
                this.assignation();
                break;
            case Type.R_CONSOLE:
                this.print();
                break;
            case Type.R_IF:
                this.instIf();
                break;
            case Type.R_FOR:
                this.instFor();
                break;
            default:
                if (this.flagError) return;
                const firsts = this.firsts.find(f => f.production === "INSTRUCTION");
                this.addError(this.preAnalysis, firsts ? firsts.first : []);
                break;
        }
    }

    private declaration() {
        const type = this.preAnalysis.typeTokenString;
        this.type();
        this.listId(type);
        this.expect(Type.SEMICOLON);
    }

    private type() {
        this.expect(this.preAnalysis.typeToken);
    }

    private listId(type: string) {
        this.idAsign(type);
        this.listIdP(type);
    }

    private idAsign(type: string) {
        const idToken = this.preAnalysis;
        this.expect(Type.IDENTIFIER);
        let value: string | number | boolean | null = null;
        if (this.isFirst("ID_ASIGN_P")) {
            this.expect(Type.ASSIGN);
            if (
                this.preAnalysis.typeToken === Type.INTEGER ||
                this.preAnalysis.typeToken === Type.DECIMAL ||
                this.preAnalysis.typeToken === Type.STRING ||
                this.preAnalysis.typeToken === Type.CHAR ||
                this.preAnalysis.typeToken === Type.R_TRUE ||
                this.preAnalysis.typeToken === Type.R_FALSE ||
                this.preAnalysis.typeToken === Type.IDENTIFIER
            ) {
                value = this.preAnalysis.lexeme;
            }
            this.expression();
        }
        this.symbolTable.add({
            name: idToken.lexeme,
            type,
            value,
            row: idToken.row,
            column: idToken.column
        });
    }

    private listIdP(type: string) {
        if (this.isFirst("LIST_ID_P")) {
            this.expect(Type.COMMA);
            this.idAsign(type);
            this.listIdP(type);
        }
    }

    private assignation() {
        this.expect(Type.IDENTIFIER);
        this.expect(Type.ASSIGN);
        this.expression();
        this.expect(Type.SEMICOLON);
    }

    private print() {
        this.expect(Type.R_CONSOLE);
        this.expect(Type.PERIOD);
        this.expect(Type.R_WRITELINE);
        this.expect(Type.PAR_O);
        this.expression();
        this.expect(Type.PAR_C);
        this.expect(Type.SEMICOLON);
    }

    private instIf() {
        this.expect(Type.R_IF);
        this.expect(Type.PAR_O);
        this.expression();
        this.expect(Type.PAR_C);
        this.expect(Type.KEY_O);
        this.listInstructions();
        this.expect(Type.KEY_C);
        this.instIfP();
    }

    private instIfP() {
        if (this.isFirst("INST_IF_P")) {
            this.expect(Type.R_ELSE);
            this.expect(Type.KEY_O);
            this.listInstructions();
            this.expect(Type.KEY_C);
        }
    }

    private instFor() {
        this.expect(Type.R_FOR);
        this.expect(Type.PAR_O);
        this.firstBlockFor();
        this.expression();
        this.expect(Type.SEMICOLON);
        this.thirdBlockFor();
        this.expect(Type.PAR_C);
        this.expect(Type.KEY_O);
        this.listInstructions();
        this.expect(Type.KEY_C);
    }

    private firstBlockFor() {
        if (this.isFirst("FIRST_BLOCK_FOR")) {
            switch (this.preAnalysis.typeToken) {
                case Type.IDENTIFIER:
                    this.assignation();
                    break;
                default:
                    this.declaration();
                    break;
            }
            return;
        }
        if (this.flagError) return;
        const firsts = this.firsts.find(f => f.production === "FIRST_BLOCK_FOR");
        this.addError(this.preAnalysis, firsts ? firsts.first : []);
    }

    private thirdBlockFor() {
        this.expect(Type.IDENTIFIER);
        this.thirdBlockForP();
    }

    private thirdBlockForP() {
        if (this.isFirst("THIRD_BLOCK_FOR_P")) {
            switch (this.preAnalysis.typeToken) {
                case Type.INC:
                    this.increment();
                    break;
                default:
                    this.decrement();
                    break;
            }
            return;
        }
        if (this.flagError) return;
        const firsts = this.firsts.find(f => f.production === "THIRD_BLOCK_FOR_P");
        this.addError(this.preAnalysis, firsts ? firsts.first : []);
    }

    private increment() {
        this.expect(Type.INC);
    }

    private decrement() {
        this.expect(Type.DEC);
    }

    private expression() {
        this.arithmetic();
        if (this.isFirst("RELATIONAL")) {
            this.expect(this.preAnalysis.typeToken);
            this.arithmetic();
        }
    }

    private relational() {
        if (this.isFirst("RELATIONAL")) {
            this.expect(this.preAnalysis.typeToken);
            this.arithmetic();
        }
    }

    private arithmetic() {
        this.term();
        this.arithmeticP();
    }

    private arithmeticP() {
        if (this.isFirst("ARITHMETIC_P")) {
            this.expect(this.preAnalysis.typeToken);
            this.term();
            this.arithmeticP();
        }
    }

    private term() {
        this.factor();
        this.termP();
    }

    private termP() {
        if (this.isFirst("TERM_P")) {
            this.expect(this.preAnalysis.typeToken);
            this.factor();
            this.termP();
        }
    }

    private factor() {
        if (this.isFirst("FACTOR")) {
            switch (this.preAnalysis.typeToken) {
                case Type.PAR_O:
                    this.expect(Type.PAR_O);
                    this.arithmetic();
                    this.expect(Type.PAR_C);
                    break;
                case Type.IDENTIFIER:
                    this.expect(Type.IDENTIFIER);
                    break;
                default:
                    this.expect(this.preAnalysis.typeToken);
                    break;
            }
            return;
        }
        if (this.flagError) return;
        const firsts = this.firsts.find(f => f.production === "FACTOR");
        this.addError(this.preAnalysis, firsts ? firsts.first : []);
    }

    private read() {
        this.preAnalysis = this.tokens[this.pos];
    }

    private expect(typeToken: Type) {
        if (this.flagError) {
            this.pos++;
            if (this.isEnd()) return;
            this.read();
            if ([Type.SEMICOLON, Type.KEY_C].includes(this.preAnalysis?.typeToken)) {
                this.flagError = false;
            }
            return;
        }
        if (this.preAnalysis && this.preAnalysis.typeToken === typeToken) {
            this.pos++;
            if (this.isEnd()) return;
            this.read();
            return;
        }
        this.addError(this.preAnalysis ?? { lexeme: "", typeTokenString: "", row: 0, column: 0 }, [typeToken]);
    }

    private isFirst(production: Production): boolean {
        const firsts = this.firsts.find(f => f.production === production);
        if (!firsts) return false;
        return firsts.first.includes(this.preAnalysis.typeToken);
    }

    private isEnd(): boolean {
        return this.pos === this.tokens.length;
    }

    private addError(token: Token, firsts: Type[]) {
        this.errorReport.add(
            token.row,
            token.column,
            token.lexeme,
            `Got Token: ${token.typeTokenString} when expect: ${firsts.map((type) => Type[type]).join('|')}`
        );
        this.flagError = true;
    }

    getErrorReport() {
        return this.errorReport.getAll();
    }

    getSymbolTable() {
        return this.symbolTable.getAll();
    }
}