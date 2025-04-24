import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes.js';

const app = express();

// middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// rutas base
app.get('/', (_, res) => res.redirect(301, '/PortalReclamos'));
app.get('/PortalReclamos', (_, res) =>
  res.sendFile('login.html', { root: 'public' })
);

// rutas API
app.use('/api', authRoutes);

export default app;
