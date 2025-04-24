import { authLdapUser } from './ldapAuth.js'; // tu lógica LDAP

export async function loginHandler(req, res) {
  const { floatingInput, floatingPassword } = req.body;
  console.log(`Usuario: ${floatingInput}`);
  console.log(`Contraseña: ${floatingPassword}`);

  try {
    const isValid = await authLdapUser(floatingInput, floatingPassword);
    console.log('Usuario autenticado:', isValid);   
    // const isValid=true;
    if (isValid) {
      return res.redirect('/reclamos.html');
    }
    res.status(401).send('Credenciales inválidas');
  } catch (err) {
    console.error('🛑 Error en login LDAP:', err.message);

    // Si es un problema de red/infra, respondemos distinto
    if (err.message.includes('conectar')) {
      return res.status(503).send('No se pudo conectar al servidor de autenticación. Verificá tu conexión o contactá a soporte.');
    }

    // Error general
    return res.status(500).send('Error interno en autenticación.');
  }
}
