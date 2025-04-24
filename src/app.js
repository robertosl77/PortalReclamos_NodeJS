import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

// middlewares
// app.use(express.static('public'));
app.use('/PortalReclamos', express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.get('/', (req, res) => {
  res.redirect('/PortalReclamos/');
});
app.get('/PortalReclamos', (req, res) => {
  res.redirect('/PortalReclamos/login.html');
});

// rutas base
app.get('/', (_, res) => res.redirect(301, '/PortalReclamos'));
app.get('/PortalReclamos', (_, res) =>
  res.sendFile('login.html', { root: 'public' })
);

// rutas API
app.use('/api', authRoutes);

export default app;
