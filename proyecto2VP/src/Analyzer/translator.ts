import { Token, Type } from "./Tokens";

function getTSType(typeToken: Type): string {
    switch (typeToken) {
        case Type.R_INT:
        case Type.R_FLOAT:
            return "number";
        case Type.R_BOOL:
            return "boolean";
        case Type.R_STRING:
            return "string";
        case Type.R_CHAR:
            return "string";
        default:
            return "any";
    }
}

export function translateTokens(tokens: Token[]): string {
    let output = "";
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        // Comentarios
        if (token.typeToken === Type.COMMENT || token.typeToken === Type.COMMENT_BLOCK) {
            output += token.lexeme + "\n";
            i++;
            continue;
        }

        // Traducción de if
        if (token.typeToken === Type.R_IF) {
            output += "if";
            i++;
            // Copia la condición (hasta la llave de apertura)
            while (i < tokens.length && tokens[i].typeToken !== Type.KEY_O) {
                output += tokens[i].lexeme;
                i++;
            }
            // Llave de apertura
            if (tokens[i]?.typeToken === Type.KEY_O) {
                output += " {\n";
                i++;
            }
            continue;
        }

        // Traducción de else
        if (token.typeToken === Type.R_ELSE) {
            output += "else ";
            i++;
            // Llave de apertura
            if (tokens[i]?.typeToken === Type.KEY_O) {
                output += "{\n";
                i++;
            }
            continue;
        }

        // Traducción de for
        if (token.typeToken === Type.R_FOR) {
            output += "for";
            i++;
            // Copia la cabecera del for (hasta la llave de apertura)
            while (i < tokens.length && tokens[i].typeToken !== Type.KEY_O) {
                output += tokens[i].lexeme;
                i++;
            }
            // Llave de apertura
            if (tokens[i]?.typeToken === Type.KEY_O) {
                output += " {\n";
                i++;
            }
            continue;
        }

        // Declaración de variables (con o sin asignación, múltiples variables)
        if (
            [Type.R_INT, Type.R_FLOAT, Type.R_BOOL, Type.R_STRING, Type.R_CHAR].includes(token.typeToken)
        ) {
            const tsType = getTSType(token.typeToken);
            output += "let ";
            i++;
            // Procesar lista de variables
            while (i < tokens.length) {
                let advanced = false;
                // Identificador
                if (tokens[i]?.typeToken === Type.IDENTIFIER) {
                    output += tokens[i].lexeme + `: ${tsType}`;
                    i++;
                    advanced = true;
                    // Asignación opcional
                    if (tokens[i]?.typeToken === Type.ASSIGN) {
                        output += " = ";
                        i++;
                        while (
                            i < tokens.length &&
                            ![Type.COMMA, Type.SEMICOLON].includes(tokens[i].typeToken)
                        ) {
                            output += tokens[i].lexeme;
                            i++;
                        }
                    }
                }
                // Coma para más variables
                if (tokens[i]?.typeToken === Type.COMMA) {
                    output += ", ";
                    i++;
                    advanced = true;
                    continue;
                }
                // Fin de declaración
                if (tokens[i]?.typeToken === Type.SEMICOLON) {
                    output += ";\n";
                    i++;
                    break;
                }
                // Si no avanzó, avanza para evitar ciclo infinito
                if (!advanced) i++;
            }
            continue;
        }

        // Asignación simple
        if (
            token.typeToken === Type.IDENTIFIER &&
            tokens[i + 1]?.typeToken === Type.ASSIGN
        ) {
            output += `${token.lexeme} = `;
            i += 2;
            // Valor asignado
            while (i < tokens.length && tokens[i].typeToken !== Type.SEMICOLON) {
                output += tokens[i].lexeme;
                i++;
            }
            output += ";\n";
            i++; // Saltar punto y coma
            continue;
        }

        // Console.WriteLine -> console.log
        if (
            token.typeToken === Type.R_CONSOLE &&
            tokens[i + 1]?.typeToken === Type.PERIOD &&
            tokens[i + 2]?.typeToken === Type.R_WRITELINE
        ) {
            output += "console.log";
            i += 3;
            // Copiar todo lo que está dentro de los paréntesis
            while (i < tokens.length && tokens[i].typeToken !== Type.SEMICOLON) {
                output += tokens[i].lexeme;
                i++;
            }
            output += ";\n";
            i++; // Saltar punto y coma
            continue;
        }

        // Ignorar encabezados y estructura de clase/método
        if (
            [
                Type.R_USING, Type.R_SYSTEM, Type.SEMICOLON,
                Type.R_PUBLIC, Type.R_CLASS, // class name
                Type.R_STATIC, Type.R_VOID, Type.R_MAIN,
                Type.PAR_O, Type.PAR_C
            ].includes(token.typeToken)
        ) {
            i++;
            continue;
        }

        // Ignorar parámetros de Main: string [ ] args
        if (
            token.typeToken === Type.R_STRING &&
            tokens[i + 1]?.typeToken === Type.BRA_O &&
            tokens[i + 2]?.typeToken === Type.BRA_C &&
            tokens[i + 3]?.typeToken === Type.IDENTIFIER
        ) {
            i += 4;
            continue;
        }

        // Llaves de apertura/cierre: solo copia para el cuerpo principal
        if (token.typeToken === Type.KEY_O || token.typeToken === Type.KEY_C) {
            output += token.lexeme + "\n";
            i++;
            continue;
        }

        // Si no se reconoce, solo copia el lexema (para operaciones, literales, etc.)
        output += token.lexeme;
        i++;
    }

    return output;
}