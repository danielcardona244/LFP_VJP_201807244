import express from 'express';
import path from 'path';
import analyzeRouter from './routes/analyze.routes';

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas de análisis léxico
app.use("/api", analyzeRouter);

// Página principal (puedes personalizarla luego)
app.get('/', (req, res) => {
    res.render('pages/index');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});