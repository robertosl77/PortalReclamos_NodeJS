import { getConnection } from '../config/db.js';
import { 
  QUERY_RECLAMOS_ACTIVOS, 
  QUERY_RECLAMOS_CERRADOS, 
  QUERY_VALIDA_CUENTA, 
  QUERY_BUSCA_CLIENTE } from '../queries/reclamosQueries.js';
import { appIdentifier } from '../config/appConfig.js';
import { logReclamoOracle } from '../utils/log.js';

export async function obtenerReclamosActivos(req, res) {

  const { cuenta } = req.params;

  if (!cuenta) {
    return res.status(400).json({ error: 'Debe especificar una cuenta' });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(QUERY_RECLAMOS_ACTIVOS, [cuenta]);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos activos:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}

export async function obtenerReclamosCerrados(req, res) {

  const { cuenta } = req.params;

  if (!cuenta) {
    return res.status(400).json({ error: 'Debe especificar una cuenta' });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(QUERY_RECLAMOS_CERRADOS, [cuenta]);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos cerrados:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}

export async function validaCuenta(req, res) {

  const { cuenta } = req.params;

  if (!cuenta) {
    return res.status(400).json({ error: 'Debe especificar una cuenta' });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(QUERY_VALIDA_CUENTA, [cuenta]);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos cerrados:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}

export async function buscaCliente(req, res) {

  const { cuenta } = req.params;

  if (!cuenta) {
    return res.status(400).json({ error: 'Debe especificar una cuenta' });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(QUERY_BUSCA_CLIENTE, [cuenta]);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos cerrados:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}

export async function buscarReclamos(req, res) {
  const { cuenta, ahora } = req.params;
  const usuario = 'DDPP_Administrador'; // Simulamos el usuario

  if (!cuenta || !ahora) {
    return res.status(400).json({ error: 'Debe especificar cuenta y fecha' });
  }

  // Validación formato de fecha
  const esFechaValida = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ahora);
  if (!esFechaValida) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Esperado: YYYY-MM-DD HH:mm:ss' });
  }

  try {
    const connection = await getConnection();

    // Reclamos activos
    const activosRes = await connection.execute(QUERY_RECLAMOS_ACTIVOS, [cuenta]);

    // Reclamos cerrados
    const cerradosRes = await connection.execute(QUERY_RECLAMOS_CERRADOS, [cuenta]);

    const app = appIdentifier
    const activos = activosRes.rows;
    const cerrados = cerradosRes.rows;
    
    console.log(`Activos: ${activos.length}, Cerrados: ${cerrados.length}`);
    
    const reclamos = [...activos, ...cerrados];


    // Loguear todos los reclamos
    let logId = 0;
    // console.log('Reclamos:', reclamos);
    if (reclamos.length === 0) {
      // No hay reclamos, se loguea uno básico
      logId = await logReclamoOracle({
        usuario,
        ahora,
        cuenta,
        estado: 'Sin Datos',
        app,
        logId: 0
      });
    } else {
      for (const reclamo of reclamos) {
        logId = await logReclamoOracle({
          usuario,
          ahora,
          cuenta,
          reclamo_id: reclamo[3],
          documento_id: reclamo[0],
          estado: reclamo[16],
          inicio_afectacion: reclamo[7],
          inicio_reclamo: reclamo[8],
          despacho: reclamo[9],
          arribo: reclamo[10],
          estimacion: reclamo[11],
          reposicion: reclamo[12],
          observaciones: reclamo[13],
          fecha_interrupcion: reclamo[14],
          id_inter: reclamo[15],
          app: appIdentifier,
          logId
        });
        console.log('Log ID:', logId);
      }
    }

    res.json(reclamos);
  } catch (err) {
    console.error('❌ Error general en búsqueda de reclamos:', err);
    res.status(500).json({ error: 'Error al consultar reclamos o registrar log' });
  }
}
