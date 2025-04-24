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

// Esto le permite a Express leer datos enviados con application/x-www-form-urlencoded, que es lo que hacen los formularios HTML por defecto.
app.use(express.urlencoded({ extended: true }));

// Ruta por defecto (redirección desde / a /PortalReclamos)
app.get('/', (req, res) => {
  console.log('Redirigiendo a /PortalReclamos');
  res.redirect(301, '/PortalReclamos'); // Redirige con un código de estado 301
});

// Ruta principal
app.get('/PortalReclamos', (req, res) => {
  res.sendFile('login.html', { root: 'public' }); // Retorna el archivo login.html
});

app.post('/api/login', (req, res) => {
  const { floatingInput, floatingPassword } = req.body;
  console.log(`Usuario: ${floatingInput}`);
  console.log(`Contraseña: ${floatingPassword}`);

  // Más adelante: validación contra LDAP
  // res.send('Login recibido');
  if (floatingInput && floatingPassword) {
    return res.redirect('/reclamos.html');
  }

  // Si algo falla
  res.status(401).send('Credenciales inválidas');
    
});

// escuchar el puerto
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/PortalReclamos`);
});



