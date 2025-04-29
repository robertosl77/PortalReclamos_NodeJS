import ldap from 'ldapjs';

export async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    console.info('🟦 Iniciando autenticación LDAP para usuario:', username);

    let userRoles = [
      "CN=APP_GELEC_ADMINISTRADOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_CAT_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_CAT_OP,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_SUPERVISOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor"
    ];

    const ldapConfig = {
      LDAP_URL: process.env.LDAP_URL,
      LDAP_BIND_DN: process.env.LDAP_BIND_DN,
      LDAP_BIND_PASSWORD: process.env.LDAP_BIND_PASSWORD,
      LDAP_USER_SEARCH_BASE: process.env.LDAP_USER_SEARCH_BASE,
      LDAP_USER_SEARCH_FILTER: process.env.LDAP_USER_SEARCH_FILTER
    };

    console.info('🔌 Creando cliente LDAP para conexión...');
    const client = ldap.createClient({
      url: ldapConfig.LDAP_URL,
      reconnect: true,
      timeout: 5000,
      connectTimeout: 10000
    });

    console.info('🔐 Realizando bind con cuenta de servicio...');
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
                userRoles = attr.vals || attr.values || [];
              }
            });
            console.info('📋 Grupos encontrados:', userRoles.length, 'grupos.');
          }
        });

        searchRes.on('error', (err) => {
          console.error('❌ Error durante el procesamiento de la búsqueda:', err.message);
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

            console.info('✅ Usuario autenticado correctamente.');
            return resolve({ authenticated: true, roles: userRoles });
          });
        });
      });
    });
  });
}
