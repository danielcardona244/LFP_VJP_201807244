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
            const result = translateIf(tokens, i);
            output += result.code;
            i = result.nextIndex;
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

function translateBlock(tokens: Token[], startIndex: number): { code: string, nextIndex: number } {
    let output = "";
    let i = startIndex;
    let braceCount = 0;
    if (tokens[i]?.typeToken === Type.KEY_O) {
        output += "{\n";
        i++;
        braceCount = 1;
        while (i < tokens.length && braceCount > 0) {
            // Traduce if anidados y else
            if (tokens[i].typeToken === Type.R_IF) {
                const result = translateIf(tokens, i);
                output += result.code;
                i = result.nextIndex;
                continue;
            }
            if (tokens[i].typeToken === Type.R_ELSE) {
                output += "else ";
                i++;
                const block = translateBlock(tokens, i);
                output += block.code;
                i = block.nextIndex;
                continue;
            }
            // Llave de apertura
            if (tokens[i].typeToken === Type.KEY_O) {
                braceCount++;
                output += "{\n";
                i++;
                continue;
            }
            // Llave de cierre
            if (tokens[i].typeToken === Type.KEY_C) {
                braceCount--;
                output += "}\n";
                i++;
                if (braceCount === 0) break;
                continue;
            }
            // Console.WriteLine
            if (
                tokens[i].typeToken === Type.R_CONSOLE &&
                tokens[i + 1]?.typeToken === Type.PERIOD &&
                tokens[i + 2]?.typeToken === Type.R_WRITELINE
            ) {
                output += "console.log";
                i += 3;
                while (i < tokens.length && tokens[i].typeToken !== Type.SEMICOLON) {
                    output += tokens[i].lexeme;
                    i++;
                }
                output += ";\n";
                i++;
                continue;
            }
            // Declaraciones, asignaciones, etc. (puedes agregar más casos aquí)
            output += tokens[i].lexeme;
            if (tokens[i].typeToken === Type.SEMICOLON) output += "\n";
            i++;
        }
    }
    return { code: output, nextIndex: i };
}

function translateIf(tokens: Token[], startIndex: number): { code: string, nextIndex: number } {
    let output = "if";
    let i = startIndex + 1;
    // Copia la condición completa entre PAR_O y PAR_C
    if (tokens[i]?.typeToken === Type.PAR_O) {
        output += "(";
        i++;
        let parenCount = 1;
        while (i < tokens.length && parenCount > 0) {
            if (tokens[i].typeToken === Type.PAR_O) {
                output += "(";
                parenCount++;
            } else if (tokens[i].typeToken === Type.PAR_C) {
                parenCount--;
                output += ")";
                if (parenCount === 0) {
                    i++; // Avanza después del PAR_C final
                    break;
                }
            } else {
                output += tokens[i].lexeme;
            }
            i++;
        }
    }
    // Traduce el bloque del if
    const block = translateBlock(tokens, i);
    output += block.code;
    i = block.nextIndex;
    return { code: output, nextIndex: i };
}