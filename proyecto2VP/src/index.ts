import express from 'express';
import path from 'path';
import { analyze } from './controllers/Analyze.controller';

const app = express();

app.use(express.text());
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views/pages'));

app.get('/', (req, res) => res.render('index'));
app.post('/analyze', analyze);

app.listen(3000, () => {
    console.log(`Servidor corriendo en puerto 3000`);
});
