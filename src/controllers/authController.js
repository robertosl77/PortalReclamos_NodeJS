import { authLdapUser } from './ldapAuth.js';

export async function loginHandler(req, res) {
  const { floatingInput, floatingPassword } = req.body;
  console.info(`Usuario: ${floatingInput}`);
  console.info(`Contraseña: ${floatingPassword}`);

  try {
    // const isValid = await authLdapUser(floatingInput, floatingPassword);
    const isValid = true; // Simulación de autenticación LDAP exitosa

    if (isValid) {
      // return res.redirect('/reclamos.html');
      return res.redirect('/PortalReclamos/reclamos.html');
    }
    res.status(401).send('Credenciales inválidas');
  } catch (err) {
    console.error('🛑 Error en login LDAP:', err.message);

    // Si es un problema de red/infra, respondemos distinto
    if (err.message.includes('conectar')) {
      return res.status(503).send('No se pudo conectar al servidor de autenticación. Verificá tu conexión o contactá a soporte.');
    }

    // Error general
    console.error('Error en autenticación:', err.message);
    return res.status(500).send('Error interno en autenticación.');
  }
}
