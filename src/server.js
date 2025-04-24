import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/PortalReclamos`);
});









// Ruta por defecto (redirección desde / a /PortalReclamos)
// app.get('/', (req, res) => {
//   console.log('Redirigiendo a /PortalReclamos');
//   res.redirect(301, '/PortalReclamos'); // Redirige con un código de estado 301
// });

// Ruta principal
// app.get('/PortalReclamos', (req, res) => {
//   res.sendFile('login.html', { root: 'public' }); // Retorna el archivo login.html
// });

// app.post('/api/login', (req, res) => {
//   const { floatingInput, floatingPassword } = req.body;
//   console.log(`Usuario: ${floatingInput}`);
//   console.log(`Contraseña: ${floatingPassword}`);

//   // Más adelante: validación contra LDAP
//   // res.send('Login recibido');
//   if (floatingInput && floatingPassword) {
//     return res.redirect('/reclamos.html');
//   }

//   // Si algo falla
//   res.status(401).send('Credenciales inválidas');

// });





