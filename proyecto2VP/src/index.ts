import express from 'express';
import path from 'path';
import analyzeRouter from './routes/analyze.routes';

const app = express();

app.use(express.text());
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views/pages'));

app.get('/', (req, res) => res.render('index'));
app.use(analyzeRouter);

app.listen(3000, () => {
    console.log(`Servidor corriendo en puerto 3000`);
});
