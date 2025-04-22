import express from 'express';
import dotenv from 'dotenv'; 

// cargar las variables de entorno desde el archivo .env
dotenv.config();

// intancia de express
const app = express();

// obtiene el puerto desde el archivo .env o usa el puerto 8080 por defecto
const PORT = process.env.PORT || 8080;

// Ruta por defecto
app.get('/', (req, res) => {
    res.redirect('/PortalReclamos');
});

// Ruta principal
app.get('/PortalReclamos', (req, res) => {
    res.send('Bienvenido a Portal Reclamos');
});

// escuchar el puerto
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/PortalReclamos`);
});



