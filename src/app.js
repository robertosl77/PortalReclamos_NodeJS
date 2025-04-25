import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware para leer formularios (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// ✅ Sirve archivos estáticos desde la carpeta /public con ruta base /PortalReclamos
app.use('/PortalReclamos', express.static('public'));

// ✅ Redirecciones claras
app.get('/', (req, res) => {
  res.redirect('/PortalReclamos/');
});

app.get('/PortalReclamos', (req, res) => {
  res.redirect('/PortalReclamos/');
});

app.get('/PortalReclamos/', (req, res) => {
  res.redirect('/PortalReclamos/login.html');
});

// ✅ Rutas de API
app.use('/api', authRoutes);

export default app;
