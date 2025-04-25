import { getConnection } from '../config/db.js';
import oracledb from 'oracledb';
import { appIdentifier } from '../config/appConfig.js';

export async function logReclamoOracle(params) {
  // console.log('[logReclamoOracle] Parámetros recibidos:', params);

  const {
    usuario,
    ahora,
    cuenta,
    reclamo_id = null,
    documento_id = null,
    estado = null,
    inicio_afectacion = null,
    inicio_reclamo = null,
    despacho = null,
    arribo = null,
    estimacion = null,
    reposicion = null,
    observaciones = null,
    fecha_interrupcion = null,
    id_inter = null,
    app = appIdentifier,
    logId = 0
  } = params;

  try {
    const connection = await getConnection();

    const binds = {
      usuario,                // 1. P_USUARIO
      ahora,                 // 2. P_FECHA_ACCION
      cuenta,                // 3. P_CUENTA
      reclamo_id,            // 4. P_RECLAMO_ID
      documento_id,          // 5. P_DOCUMENT_ID
      estado,                // 6. P_ESTADO
      inicio_afectacion,     // 7. P_INICIO_AFECTACION
      inicio_reclamo,        // 8. P_INICIO_RECLAMO
      despacho,              // 9. P_DESPACHO
      arribo,                // 10. P_ARRIBO
      estimacion,            // 11. P_ESTIMACION
      reposicion,            // 12. P_REPOSICION
      observaciones,         // 13. P_OBSERVACIONES
      fecha_interrupcion,    // 14. P_FECHA_INTERRUPCION
      id_inter,              // 15. P_ID_INTER
      app: appIdentifier,    // 16. P_ORIGEN
      log_id: {
        dir: oracledb.BIND_INOUT,
        type: oracledb.NUMBER,
        val: logId           // 17. P_LOG_ID
      }
    };

    console.log('[logReclamoOracle] Ejecutando con binds:', binds);

    const sql = `
      BEGIN
        NEXUS_GIS.ENRE_INSERTALOG_RECLAMOS(
          :usuario,
          :ahora,
          :cuenta,
          :reclamo_id,
          :documento_id,
          :estado,
          :inicio_afectacion,
          :inicio_reclamo,
          :despacho,
          :arribo,
          :estimacion,
          :reposicion,
          :observaciones,
          :fecha_interrupcion,
          :id_inter,
          :app,
          :log_id
        );
      END;
    `;

    await connection.execute(sql, binds, { autoCommit: true });

    return binds.log_id.val;

  } catch (err) {
    console.error('❌ Error al insertar log de reclamo:', err);
    return logId;
  }
}
