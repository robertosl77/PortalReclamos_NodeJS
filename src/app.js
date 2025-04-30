import express from 'express';
import authRoutes from './routes/auth.routes.js';
import reclamosRoutes from './routes/reclamos.routes.js';
import session from 'express-session';

const app = express();

app.use(session({
  secret: 'clave_secreta_segura', // ⚠️ poné algo más seguro en producción
  resave: false,  // false: si no hay cambios en la sesion no vuelve a guardar en memoria, redis, etc. 
  saveUninitialized: false, // evita guardar sesiones anonimas/basuras, alguien entra al sitio pero no se logea...
  cookie: {
    maxAge: 10 * 60 * 1000  // 🕒 10 minutos en milisegundos
  }
}));

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