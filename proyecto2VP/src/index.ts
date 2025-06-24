import express from 'express';
import { analyze } from './controllers/Analyze.controller';

const app = express();

// Permite recibir texto plano desde Postman
app.use(express.text());

// Define una ruta POST específica para analizar el texto
app.post('/analyze', analyze);

app.listen(3000, () => {
    console.log(`Servidor corriendo en puerto 3000`);
});
