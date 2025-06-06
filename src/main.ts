// servidor

import expres from 'express';
import { Request, Response } from 'express';

const app = expres();
const PORT = 3000;  

app.get('/', (req: Request, res: Response) => {
    res.send('¡Hola, mundo desde Express!');    
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT} del curso`);
}); 
