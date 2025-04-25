import express from 'express';
import authRoutes from './routes/auth.routes.js';
import reclamosRoutes from './routes/reclamos.routes.js';

const app = express();

// Middleware para leer formularios (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use('/api', reclamosRoutes);

// Redirecciones
app.get('/', (req, res) => {
  res.redirect('/PortalReclamos/login.html'); // Directo a login.html
});

// Maneja /PortalReclamos y /PortalReclamos/ (con o sin barra final)
app.get('/PortalReclamos', (req, res) => {
  res.redirect('/PortalReclamos/login.html');
});

// Sirve archivos estáticos desde /public con ruta base /PortalReclamos
app.use('/PortalReclamos', express.static('public'));

// Rutas de API
app.use('/api', authRoutes);

export default app;