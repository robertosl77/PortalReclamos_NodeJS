import ldap from 'ldapjs';

export async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    let userRoles = [
      "CN=APP_GELEC_ADMINISTRADOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_CAT_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_CAT_OP,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_SUPERVISOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor",
      "CN=APP_GELEC_ADMINISTRADOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor"
    ];

    const ldapConfig = {
      LDAP_URL: process.env.LDAP_URL,
      LDAP_BIND_DN: process.env.LDAP_BIND_DN,
      LDAP_BIND_PASSWORD: process.env.LDAP_BIND_PASSWORD,
      LDAP_USER_SEARCH_BASE: process.env.LDAP_USER_SEARCH_BASE,
      LDAP_USER_SEARCH_FILTER: process.env.LDAP_USER_SEARCH_FILTER
    };    

    const client = ldap.createClient({
      url: ldapConfig.LDAP_URL,
      reconnect: true,
      timeout: 5000,
      connectTimeout: 10000
    });

    client.bind(ldapConfig.LDAP_BIND_DN, ldapConfig.LDAP_BIND_PASSWORD, (bindErr) => {
      if (bindErr) {
        client.destroy();
        return reject(bindErr);
      }

      const searchFilter = ldapConfig.LDAP_USER_SEARCH_FILTER.replace('{{username}}', username);

      client.search(ldapConfig.LDAP_USER_SEARCH_BASE, {
        filter: searchFilter,
        scope: 'sub',
        attributes: ['dn', 'cn', 'mail', 'sAMAccountName', 'memberOf'] // <<< PEDIR memberOf
      }, (searchErr, searchRes) => {
        if (searchErr) {
          client.destroy();
          return reject(searchErr);
        }

        let userDN = null;

        searchRes.on('searchEntry', (entry) => {
          userDN = entry.objectName;

          if (entry.attributes) {
            entry.attributes.forEach(attr => {
              if (attr.type === 'memberOf') {
                userRoles = attr.vals || attr.values || [];
              }
            });
          }
        });

        searchRes.on('error', (err) => {
          client.destroy();
          reject(err);
        });

        searchRes.on('end', () => {
          if (!userDN) {
            client.destroy();
            return resolve({ authenticated: false, roles: [] });
          }

          client.bind(typeof userDN === 'object' ? userDN.toString() : userDN, String(password), (userBindErr) => {
            client.destroy();
            if (userBindErr) {
              return resolve({ authenticated: false, roles: [] });
            }

            return resolve({ authenticated: true, roles: userRoles }); // <<< DEVOLVEMOS ROLES
          });
        });
      });
    });
  });
}