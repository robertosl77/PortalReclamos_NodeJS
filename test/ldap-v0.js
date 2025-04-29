import ldap from 'ldapjs';

// Configuración LDAP con valores literales para pruebas
const ldapConfig = {
  url: 'ldap://192.168.146.214:389',
  bindDN: 'CN=SVC_consulta_ot,OU=Cuentas de Servicio,DC=qa,DC=edenor',
  bindCredentials: 'edenor2020',
  searchBase: 'ou=Edificios,DC=qa,DC=edenor',
  searchFilter: '(sAMAccountName={{username}})'
};

// Usuario y contraseña literales para pruebas
const testUsername = 'DDPP_Administrador';
const testPassword = 'Edenor2025';

// Función para autenticar un usuario
async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    console.log('🔍 Iniciando autenticación LDAP para:', username);
    console.log('🔌 Conectando a servidor:', ldapConfig.url);
    
    // Crear cliente LDAP
    const client = ldap.createClient({
      url: ldapConfig.url,
      reconnect: true,
      timeout: 5000,
      connectTimeout: 10000
    });
    
    // Eventos de conexión para depuración
    client.on('connect', () => {
      console.log('✅ Conectado al servidor LDAP');
    });
    
    client.on('connectError', (err) => {
      console.error('❌ Error de conexión:', err.message);
    });
    
    client.on('timeout', () => {
      console.error('⏱️ Timeout en la conexión');
    });
    
    client.on('error', (err) => {
      console.error('❌ Error general:', err.message);
    });
    
    // Reemplazar el placeholder en el filtro
    const searchFilter = ldapConfig.searchFilter.replace('{{username}}', username);
    
    console.log('🔐 Intentando bind con cuenta de servicio:', ldapConfig.bindDN);
    
    // Bind con la cuenta de servicio
    client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (bindErr) => {
      if (bindErr) {
        console.error('❌ Error en bind de servicio:', bindErr.message);
        console.error('   Código:', bindErr.code);
        client.destroy();
        return reject(bindErr);
      }

      console.log('✅ Bind de servicio exitoso');
      console.log('🔍 Buscando usuario con filtro:', searchFilter);
      
      // Buscar el usuario
      client.search(ldapConfig.searchBase, {
        filter: searchFilter,
        scope: 'sub',
        attributes: ['dn', 'cn', 'mail', 'sAMAccountName']
      }, (searchErr, searchRes) => {
        if (searchErr) {
          console.error('❌ Error en búsqueda:', searchErr.message);
          client.destroy();
          return reject(searchErr);
        }

        let userDN = null;

        searchRes.on('searchEntry', (entry) => {
          userDN = entry.objectName;
          console.log('✅ Usuario encontrado:', userDN);
          console.log('   DN completo:', JSON.stringify(userDN));
          
          // Mostrar atributos encontrados (usando .values en lugar de .vals)
          entry.attributes.forEach(attr => {
            const values = attr.values || attr.vals || [];
            console.log(`   ${attr.type}:`, values.join(', '));
          });
        });

        searchRes.on('error', (err) => {
          console.error('❌ Error en resultado de búsqueda:', err.message);
          client.destroy();
          reject(err);
        });

        searchRes.on('end', () => {
          if (!userDN) {
            console.log('❌ Usuario no encontrado');
            client.destroy();
            return resolve(false);
          }

          console.log('🔐 Intentando autenticar usuario con su DN');
          console.log('   Tipo de userDN:', typeof userDN);
          
          // Asegurarse de que userDN sea una cadena
          const userDNString = typeof userDN === 'object' ? userDN.toString() : userDN;
          console.log('   userDN como string:', userDNString);
          
          // Asegurarse de que la contraseña sea una cadena
          const passwordString = String(password);
          console.log('   Longitud de contraseña:', passwordString.length);
          
          // Autenticar con las credenciales del usuario
          try {
            client.bind(userDNString, passwordString, (userBindErr) => {
              if (userBindErr) {
                console.log('❌ Autenticación fallida:', userBindErr.message);
                console.log('   Código de error:', userBindErr.code);
                client.destroy();
                return resolve(false);
              }

              console.log('✅ Autenticación exitosa para:', username);
              client.destroy();
              resolve(true);
            });
          } catch (bindError) {
            console.error('❌ Error al intentar bind:', bindError.message);
            client.destroy();
            resolve(false);
          }
        });
      });
    });
  });
}

// Función principal de prueba
async function runTest() {
  console.log('=== INICIANDO PRUEBA DE CONEXIÓN LDAP ===');
  console.log('Configuración:');
  console.log('- URL:', ldapConfig.url);
  console.log('- BindDN:', ldapConfig.bindDN);
  console.log('- SearchBase:', ldapConfig.searchBase);
  console.log('- Usuario de prueba:', testUsername);
  
  try {
    console.log('\n🧪 Probando autenticación...');
    const isAuthenticated = await authenticateUser(testUsername, testPassword);
    
    console.log('\n=== RESULTADO ===');
    if (isAuthenticated) {
      console.log('✅ AUTENTICACIÓN EXITOSA');
    } else {
      console.log('❌ AUTENTICACIÓN FALLIDA');
    }
  } catch (error) {
    console.error('\n=== ERROR CRÍTICO ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n=== FIN DE PRUEBA ===');
}

// Ejecutar la prueba
runTest();