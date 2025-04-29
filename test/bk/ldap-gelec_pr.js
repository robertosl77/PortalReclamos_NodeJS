import ldap from 'ldapjs';

// Crear el cliente LDAP
const client = ldap.createClient({
  url: 'ldap://192.168.145.50:389',
});

// Hacer bind con usuario y contraseña
client.bind(
  'CN=SVC_consulta_ot,OU=Cuentas de Servicio,DC=pro,DC=edenor',
  'Edenor2010',
  (err) => {
    if (err) {
      console.error('Error en bind:', err);
      client.unbind();
      return;
    }

    console.log('Bind exitoso.');

    // Definir opciones de búsqueda
    const opts = {
      scope: 'sub', // busca en todos los niveles debajo de la base
      filter: '(&(cn=DDPP_Administrador)(|(memberOf=CN=APP_GELEC_CAT_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=pro,DC=edenor)(memberOf=CN=APP_GELEC_CAT_OP,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=pro,DC=edenor)(memberOf=CN=APP_GELEC_SUPERVISOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=pro,DC=edenor)(memberOf=CN=APP_GELEC_CONSULTA,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=pro,DC=edenor)(memberOf=CN=APP_GELEC_ADMINISTRADOR,OU=GELEC,OU=FIM-SG,OU=Grupos,DC=pro,DC=edenor)))',
      attributes: ['dn', 'cn', 'mail', 'memberOf'],
    };

    // Ejecutar la búsqueda
    client.search('ou=Edificios,dc=pro,dc=edenor', opts, (err, res) => {
      if (err) {
        console.error('Error en search:', err);
        client.unbind();
        return;
      }

      res.on('searchEntry', (entry) => {
        console.log('Resultado:', entry.object);
      });

      res.on('searchReference', (referral) => {
        console.log('Referral:', referral.uris.join());
      });

      res.on('error', (err) => {
        console.error('Error en el search event:', err);
        client.unbind();
      });

      res.on('end', (result) => {
        console.log('Búsqueda finalizada. Status:', result.status);
        client.unbind();
      });
    });
  }
);
