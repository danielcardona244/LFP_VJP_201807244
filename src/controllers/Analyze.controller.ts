import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";

export const analyzeText = (req: Request, res: Response) => {
  const { input } = req.body; // El texto a analizar debe venir en el body
  const analyzer = new LexicalAnalyzer();
  const tokens = analyzer.scanner(input);
  const errors = analyzer.getErrorList();

  res.json({
    tokens,
    errors
  });
};

export const showTeam = (req: Request, res: Response) => {
  // Ejemplo de datos, reemplaza esto con tu lógica real
  const name = "Ash";
  const pokemons = [
    { name: "venusaur", type: "planta" },
    { name: "charizard", type: "fuego" },
    { name: "dragonite", type: "dragon" },
    { name: "alakazam", type: "psiquico" },
    { name: "gyarados", type: "agua" },
    { name: "snorlax", type: "normal" }
  ];
  res.render('pages/index', { name, pokemons });
};