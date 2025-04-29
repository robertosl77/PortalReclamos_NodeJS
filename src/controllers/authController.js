import { authenticateUser } from './ldapAuth.js';

export async function loginHandler(req, res) {
  const { floatingInput, floatingPassword } = req.body;
  console.info(`Usuario: ${floatingInput}`);

  try {
    const result = await authenticateUser(floatingInput, floatingPassword);

    if (result.authenticated) {
      console.info(`✅ Login exitoso para ${floatingInput}`);
      console.info('Roles del usuario:', result.roles);

      // (Opcional) Podrías guardar roles en sessionStorage / JWT / lo que quieras

      return res.redirect('/PortalReclamos/reclamos.html');
    }

    console.warn(`❌ Login fallido para ${floatingInput}`);
    res.status(401).send('Credenciales inválidas');
  } catch (err) {
    console.error('🛑 Error en login LDAP:', err.message);

    if (err.message.includes('conectar')) {
      return res.status(503).send('No se pudo conectar al servidor de autenticación.');
    }

    return res.status(500).send('Error interno en autenticación.');
  }
}
