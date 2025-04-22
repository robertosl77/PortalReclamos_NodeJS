import express from 'express';
import dotenv from 'dotenv'; 

// cargar las variables de entorno desde el archivo .env
dotenv.config();

// intancia de express
const app = express();

// obtiene el puerto desde el archivo .env o usa el puerto 8080 por defecto
const PORT = process.env.PORT || 8080;

// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Ruta por defecto (redirección desde / a /PortalReclamos)
app.get('/', (req, res) => {
  console.log('Redirigiendo a /PortalReclamos');
  res.redirect(301, '/PortalReclamos'); // Redirige con un código de estado 301
});

// Ruta principal
app.get('/PortalReclamos', (req, res) => {
  res.sendFile('login.html', { root: 'public' }); // Retorna el archivo login.html
});

// escuchar el puerto
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/PortalReclamos`);
});



