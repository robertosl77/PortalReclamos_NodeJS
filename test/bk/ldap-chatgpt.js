import ldap from 'ldapjs';

// Variables de testing
const testUsername = 'DDPP_Administrador';   // <-- Cambiá por el usuario que quieras probar
const testPassword = 'Edenor2025';      // <-- Cambiá por la contraseña real

// Configuración LDAP
const ldapConfig = {
  url: 'ldap://192.168.146.214:389',
  bindDN: 'CN=SVC_consulta_ot,OU=Cuentas de Servicio,DC=qa,DC=edenor',
  bindCredentials: 'edenor2020',
  searchBase: 'ou=Edificios,DC=qa,DC=edenor',
  searchFilter: '(&(cn={{username}})(|(memberOf=CN=APP_GELEC_CAT_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor)(memberOf=CN=APP_GELEC_CAT_OP,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor)(memberOf=CN=APP_GELEC_SUPERVISOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor)(memberOf=CN=APP_GELEC_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor)(memberOf=CN=APP_GELEC_ADMINISTRADOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=qa,DC=edenor)))'
};

// Función para autenticar usuario
async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: ldapConfig.url,
    });
    console.log('Conectando al servidor LDAP...');
    client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (err) => {
      if (err) {
        console.error('Error en bind de servicio:', err);
        client.unbind();
        return reject(err);
      }
      console.log('Bind de servicio exitoso.');
      const searchOptions = {
        scope: 'sub',
        filter: ldapConfig.searchFilter.replace('{{username}}', username),
        attributes: ['dn'],
      };
      console.log('Buscando usuario...');
      client.search(ldapConfig.searchBase, searchOptions, (err, res) => {
        if (err) {
          console.error('Error en búsqueda:', err);
          client.unbind();
          return reject(err);
        }

        let userDN = null;
        console.log('Esperando resultados de búsqueda...');
        res.on('searchEntry', (entry) => {
          userDN = entry.object.dn;
        });
        console.log('Esperando referencias de búsqueda...');
        res.on('error', (err) => {
          console.error('Error en search event:', err);
          client.unbind();
          reject(err);
        });
        console.log('Esperando fin de búsqueda...');
        res.on('end', (result) => {
          client.unbind();

          if (!userDN) {
            console.log('Usuario no encontrado o no cumple los grupos requeridos.');
            return resolve(false);
          }
          console.log('Usuario encontrado:', userDN);
          const userClient = ldap.createClient({
            url: ldapConfig.url,
          });
          console.log('Conectando al servidor LDAP para autenticación...');
          userClient.bind(userDN, password, (err) => {
            userClient.unbind();
            if (err) {
              console.log('Password incorrecto para el usuario.');
              resolve(false);
            } else {
              console.log('Usuario autenticado correctamente.');
              resolve(true);
            }
          });
        });
      });
    });
  });
}

// Ejecutar el test
(async () => {
  try {
    const success = await authenticateUser(testUsername, testPassword);
    if (success) {
      console.log(`✅ Login OK para ${testUsername}`);
    } else {
      console.log(`❌ Login fallido para ${testUsername}`);
    }
  } catch (error) {
    console.error('Error general:', error);
  }
})();
