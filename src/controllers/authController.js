import { authLdapUser } from './ldapAuth.js'; // tu lógica LDAP

export async function loginHandler(req, res) {
  const { floatingInput, floatingPassword } = req.body;
  console.log(`Usuario: ${floatingInput}`);
  console.log(`Contraseña: ${floatingPassword}`);

  try {
    console.log("intentara autenticar");
    const isValid = await authLdapUser(floatingInput, floatingPassword);
    console.log(isValid);

    if (isValid) {
      return res.redirect('/reclamos.html');
    }

    res.status(401).send('Credenciales inválidas');
  } catch (err) {
    console.log('Error al autenticar con LDAP:', err);
    console.error('Error al autenticar con LDAP:', err);
    res.status(500).send('Error interno en autenticación');
  }
}
