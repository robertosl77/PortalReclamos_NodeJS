import ldap from 'ldapjs';
import dotenv from 'dotenv';
dotenv.config();

export async function authLdapUser(username, password) {
  // 1. Crear cliente con LDAP_URL
  const client = ldap.createClient({
    url: process.env.LDAP_URL,
  });

  client.on('error', (err) => {
    // console.error('[LDAP CLIENT ERROR]', err.message);
    throw new Error(`[LDAP CLIENT ERROR] ${err.message}`);
  });

  // 2. Bind con cuenta técnica
  await new Promise((resolve, reject) => {
    client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
      if (err) reject('Bind técnico falló: ' + err);
      else resolve();
    });
  });

  // 3. Construir filtro reemplazando {0} por el username
  const searchOptions = {
    scope: 'sub',
    filter: process.env.LDAP_USER_FILTER.replace('{0}', username),
    attributes: ['dn', 'cn', 'mail'] 
  };

  /**
   * Scopes: 
    * - base: solo el objeto base (el que se busca) 
    * - one: solo los hijos directos del objeto base (no busca en subárboles)
    * - sub: busca en el objeto base y en todos sus descendientes (subárboles)

    * Filter:
    * - (objectClass=*) → todos los objetos del directorio
    * - (objectClass=user) → solo los objetos de tipo usuario
    * - (objectClass=group) → solo los objetos de tipo grupo
    * - (objectClass=organizationalUnit) → solo los objetos de tipo unidad organizativa

   * Lista de Atributos que se pueden pedir al LDAP:

        attributes: [
            'dn',                   // Distinguished Name completo del objeto (identificador absoluto)
            'cn',                   // Common Name (nombre del usuario o grupo)
            'sAMAccountName',       // Nombre de cuenta (usado en login en AD)
            'userPrincipalName',    // Nombre principal de usuario (como un email)
            'mail',                 // Correo electrónico
            'givenName',            // Nombre de pila (nombre)
            'sn',                   // Apellido (surname)
            'displayName',          // Nombre para mostrar (generalmente nombre completo)
            'memberOf',             // Lista de grupos a los que pertenece el usuario
            'telephoneNumber',      // Número de teléfono
            'title',                // Cargo del usuario
            'department',           // Departamento
            'company',              // Empresa
            'whenCreated',          // Fecha de creación del objeto en el directorio
            'lastLogonTimestamp',   // Último login (solo en AD)
        ]

    * Comodin para traer todos los atributos: 

        attributes: ['*']

   */

  // 4. Buscar el usuario con el filtro y la base de búsqueda (LDAP_USER_BASE) 
  const userDn = await new Promise((resolve, reject) => {
    let found = null;

    client.search(process.env.LDAP_USER_BASE, searchOptions, (err, res) => {
      if (err) reject('Error en search: ' + err);

      res.on('searchEntry', (entry) => {
        found = entry.object;
        console.log('--- Usuario encontrado ---');
        console.log(entry.object); // 🔍 Acá ves todos los atributos disponibles
      });

      res.on('end', () => {
        if (!found) reject('Usuario no encontrado');
        else resolve(found.dn);
      });
    });
  });

  // 5. Si lo encontrás, intentá otro bind con DN del usuario y el password recibido
  await new Promise((resolve, reject) => {
    client.bind(userDn, password, (err) => {
      if (err) reject('Credenciales inválidas');
      else resolve();
    });
  });

  // 6. Cerrar la conexión LDAP
  client.unbind();

  // 7. Si todo va bien, devolvés true
  return true;

}
