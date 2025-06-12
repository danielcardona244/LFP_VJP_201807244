import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";

// Extrae jugadores y sus pokémon a partir de la lista de tokens
function extraerJugadores(tokens: any[]): any[] {
    const jugadores: any[] = [];
    let jugadorActual: any = null;
    let pokemonActual: any = null;
    let statActual: string | null = null;

    tokens.forEach(token => {
        if (token.tipo === 4 && token.lexema.toLowerCase() === "jugador") {
            if (jugadorActual) jugadores.push(jugadorActual);
            jugadorActual = { name: "", pokemons: [] };
        } else if (token.tipo === 7 && jugadorActual && !jugadorActual.name) {
            jugadorActual.name = token.lexema.replace(/"/g, "");
        } else if (token.tipo === 7 && jugadorActual) {
            pokemonActual = { name: token.lexema.replace(/"/g, ""), type: "", salud: 0, ataque: 0, defensa: 0 };
        } else if (token.tipo === 5 && pokemonActual) {
            pokemonActual.type = token.lexema;
        } else if (token.tipo === 8 && pokemonActual) { // ID: nombre del stat
            statActual = token.lexema.replace(/\[|\]/g, "").toLowerCase();
        } else if (token.tipo === 6 && pokemonActual && statActual) { // NUMBER: valor del stat
            if (["salud", "ataque", "defensa"].includes(statActual)) {
                pokemonActual[statActual] = Number(token.lexema);
            }
            statActual = null;
        } else if (token.tipo === 1 && pokemonActual) { // PAR_CLOSE: fin del pokémon
            jugadorActual.pokemons.push(pokemonActual);
            pokemonActual = null;
        }
    });

    if (jugadorActual) jugadores.push(jugadorActual);
    return jugadores;
}

// Selecciona los 6 pokémon con mayor IV total (salud + ataque + defensa)
function seleccionarMejoresPokemons(pokemons: any[]): any[] {
    pokemons.forEach(p => {
        const suma = (p.salud || 0) + (p.ataque || 0) + (p.defensa || 0);
        p.ivTotal = ((suma / 45) * 100);
    });
    pokemons.sort((a, b) => b.ivTotal - a.ivTotal);
    return pokemons.slice(0, 6);
}

// Analiza el texto y retorna tokens y errores léxicos (API para el frontend)
export const analyzeText = (req: Request, res: Response) => {
    const { input } = req.body;
    const analyzer = new LexicalAnalyzer();
    const tokens = analyzer.scanner(input);
    const errors = analyzer.getErrorList();

    res.json({
        tokens,
        errors
    });
};

// Muestra la página de equipos solo si no hay errores léxicos
export const showTeam = (req: Request, res: Response) => {
    const input = req.body.input || ""; 
    const analyzer = new LexicalAnalyzer();
    const tokens = analyzer.scanner(input);
    const errors = analyzer.getErrorList();

    if (errors && errors.length > 0) {
        return res.render('pages/teams', { jugadores: [], errorMsg: "Corrige todos los errores léxicos antes de ver los equipos." });
    }

    const jugadores = extraerJugadores(tokens);

    jugadores.forEach(jugador => {
        jugador.pokemons = seleccionarMejoresPokemons(jugador.pokemons);
    });

    res.render('pages/teams', { jugadores, errorMsg: null });
};