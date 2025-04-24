import ldap from 'ldapjs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Autentica un usuario contra un servidor LDAP.
 * 1. Conexión al servidor
 * 2. Bind técnico (cuenta de servicio)
 * 3. Búsqueda del usuario
 * 4. Bind del usuario con su password
 */

export async function authLdapUser(username, password) {
  let client;

  try {
    client = ldap.createClient({
      url: process.env.LDAP_URL,
      timeout: 5000,
      connectTimeout: 5000,
    });
    console.log('Cliente LDAP creado:', client);

    // 💡 En lugar de throw directo, usamos una Promise que rechaza
    await new Promise((resolve, reject) => {
      client.on('error', (err) => {
        console.error('❌ Error de conexión LDAP:', err.message);
        reject(new Error('No se pudo conectar al servidor de autenticación.'));
      });

      // Probamos conectar haciendo el bind técnico
      client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
        if (err) {
          reject(new Error('Bind técnico falló: ' + err.message));
        } else {
          resolve();
        }
      });
    });

    // 🔍 Búsqueda del usuario
    const searchOptions = {
      scope: 'sub',
      filter: process.env.LDAP_USER_FILTER.replace('{0}', username),
      attributes: ['dn', 'cn', 'mail'],
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

    const userDn = await new Promise((resolve, reject) => {
      let found = null;

      client.search(process.env.LDAP_USER_BASE, searchOptions, (err, res) => {
        if (err) return reject(new Error('Error en búsqueda LDAP: ' + err.message));

        res.on('searchEntry', (entry) => {
          found = entry.dn?.toString();
        });

        res.on('end', () => {
          if (!found) reject(new Error('Usuario no encontrado'));
          else resolve(found);
        });
      });
    });

    // 🔑 Bind con las credenciales del usuario
    await new Promise((resolve, reject) => {
      client.bind(userDn, password, (err) => {
        if (err) reject(new Error('Credenciales inválidas'));
        else resolve();
      });
    });

    client.unbind();
    return true;
  } catch (err) {
    if (client) client.unbind(); // siempre cerramos
    throw new Error(`[authLdapUser] ${err.message || err}`);
  }
}
