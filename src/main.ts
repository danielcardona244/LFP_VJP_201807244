// servidor

import express from 'express';
import { Request, Response } from 'express';
import analyzeRouter from './routes/analyze.route';
import path from 'path';

const app = express();
const PORT = 3000;  

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use("/api", analyzeRouter);

app.get('/', (req: Request, res: Response) => {
    res.render('pages/index', { name: "", pokemons: [] });
});



app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
