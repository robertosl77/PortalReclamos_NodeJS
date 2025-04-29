import net from 'net';

const socket = net.connect({ host: '192.168.145.50', port: 636 }, () => {
  console.log('✅ Conexión TCP abierta a LDAP');
  socket.end();
});

socket.on('error', (err) => {
  console.error('❌ Error al conectar:', err.message);
});
