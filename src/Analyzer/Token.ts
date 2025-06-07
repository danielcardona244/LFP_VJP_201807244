export enum Type {
  PAR_OPEN,         // (
  PAR_CLOSE,        // )
  SEMICOLON,        // ;
  EQUAL,            // =
  RESERVED_WORD,    // jugador, pokemon, salud, ataque, defensa
  TYPE,             // agua, dragon, planta, psiquico, fuego, normal
  NUMBER,           // Números enteros
  STRING,           // Cadenas de texto entre comillas
  ID,               // Identificadores (nombres de jugador o Pokémon no reservados)
  COLON,            // :
  COMMA,            // ,
  UNKNOW            // Caracteres desconocidos
}

export class Token {
  constructor(
    public tipo: Type,
    public lexema: string,
    public fila: number,
    public columna: number
  ) {}
}