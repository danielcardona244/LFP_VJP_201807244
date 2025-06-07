// servidor

import express from 'express';
import { Request, Response } from 'express';
import analyzeRouter from './routes/analyze.route';

const app = express();
const PORT = 3000;  

app.use(express.json());
app.use("/api", analyzeRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('¡Hola, mundo desde Express!');    
});



app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
