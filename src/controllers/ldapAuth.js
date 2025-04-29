import ldap from 'ldapjs';
import 'dotenv/config';

function normalizeRoles(rolesLdap) {
  if (!Array.isArray(rolesLdap)) return [];

  return rolesLdap.map(role => {
    const match = role.match(/^CN=([^,]+),/);
    return match ? match[1] : role;
  });
}

const ldapConfig = {
  LDAP_URL: process.env.LDAP_URL,
  LDAP_BIND_DN: process.env.LDAP_BIND_DN,
  LDAP_BIND_PASSWORD: process.env.LDAP_BIND_PASSWORD,
  LDAP_USER_SEARCH_BASE: process.env.LDAP_USER_SEARCH_BASE,
  LDAP_USER_SEARCH_FILTER: process.env.LDAP_USER_SEARCH_FILTER
};

const gruposAutorizados = process.env.LDAP_GRUPOS_AUTORIZADOS
  ? process.env.LDAP_GRUPOS_AUTORIZADOS.split(';').map(s => s.trim())
  : [];
  console.log(gruposAutorizados);

if (!gruposAutorizados.length) {
  console.error('❌ Error crítico: No hay grupos autorizados configurados en LDAP_GRUPOS_AUTORIZADOS.');
  process.exit(1);
}  

export async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    console.info('🟦 Iniciando autenticación LDAP para usuario:', username);

    let todosLosRoles = [];
    let userRoles = [];

    const client = ldap.createClient({
      url: ldapConfig.LDAP_URL,
      reconnect: true,
      timeout: 5000,
      connectTimeout: 10000
    });

    console.info('🔌 Creando cliente LDAP para conexión...');
    client.bind(ldapConfig.LDAP_BIND_DN, ldapConfig.LDAP_BIND_PASSWORD, (bindErr) => {
      if (bindErr) {
        console.error('❌ Error en bind de servicio:', bindErr.message);
        client.destroy();
        return reject(bindErr);
      }

      console.info('✅ Bind de servicio exitoso.');
      const searchFilter = ldapConfig.LDAP_USER_SEARCH_FILTER.replace('{{username}}', username);
      console.info('🔎 Ejecutando búsqueda de usuario con filtro:', searchFilter);

      client.search(ldapConfig.LDAP_USER_SEARCH_BASE, {
        filter: searchFilter,
        scope: 'sub',
        attributes: ['dn', 'cn', 'mail', 'sAMAccountName', 'memberOf']
      }, (searchErr, searchRes) => {
        if (searchErr) {
          console.error('❌ Error en búsqueda de usuario:', searchErr.message);
          client.destroy();
          return reject(searchErr);
        }

        let userDN = null;

        searchRes.on('searchEntry', (entry) => {
          console.info('📥 Usuario encontrado en búsqueda LDAP.');
          userDN = entry.objectName;

          if (entry.attributes) {
            entry.attributes.forEach(attr => {
              if (attr.type === 'memberOf') {
                todosLosRoles = attr.values || attr.vals || [];
              }
            });
            console.info('📋 Grupos encontrados:', todosLosRoles.length, 'grupos.');
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ Error durante búsqueda LDAP:', err.message);
          client.destroy();
          reject(err);
        });

        searchRes.on('end', () => {
          console.info('🏁 Búsqueda finalizada.');
          if (!userDN) {
            console.warn('⚠️ No se encontró DN para el usuario.');
            client.destroy();
            return resolve({ authenticated: false, roles: [] });
          }

          console.info('🔐 Realizando bind con usuario final para validar contraseña...');
          client.bind(typeof userDN === 'object' ? userDN.toString() : userDN, String(password), (userBindErr) => {
            client.destroy();
            if (userBindErr) {
              console.warn('❌ Password incorrecta para el usuario.');
              return resolve({ authenticated: false, roles: [] });
            }

            console.info('✅ Password correcta. Filtrando roles autorizados...');
            userRoles = todosLosRoles.filter(role => gruposAutorizados.includes(role));
            console.info('🎯 Roles coincidentes encontrados:', userRoles);

            if (userRoles.length > 0) {
              console.info('✅ Usuario pertenece a al menos un grupo autorizado.');
              const rolesNormalizados = normalizeRoles(userRoles);

              return resolve({ authenticated: true, roles: rolesNormalizados });
            } else {
              console.warn('🚫 Usuario autenticado pero NO pertenece a ningún grupo autorizado.');
              return resolve({ authenticated: false, roles: [] });
            }
          });
        });
      });
    });
  });
}
