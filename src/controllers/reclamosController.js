import { getConnection } from '../config/db.js';

export async function obtenerReclamosActivos(req, res) {
  try {
    const connection = await getConnection();

    const result = await connection.execute(`
      SELECT 
          D.ID DOCUMENT_ID
          , D.NAME NRO_DOCUMENTO
          , C.PROPERTY_VALUE CUENTA
          , C.ID RECLAMO_ID
          , C.NAME RECLAMO
          , SUBSTR(C.NAME, INSTR(C.NAME, '-', -1) + 1) AS RECLAMO_NRO
          , (SELECT DESCRIPTION FROM NEXUS_GIS.FDL_CLAIM_TYPE WHERE ID=C.TYPE_ID) TIPO
          , D.OUTAGE_TIME INICIO_AFECTACION
          , C.CUSTOMER_TIME INICIO_RECLAMO
          , (SELECT MIN(DISPATCH_TIME) FROM NEXUS_GIS.OMS_DISPATCH WHERE STATE_ID<>4 AND DOCUMENT_ID=D.ID) DESPACHO
          , (SELECT MIN(ARRIVAL_TIME) FROM NEXUS_GIS.OMS_DISPATCH WHERE STATE_ID<>4 AND DOCUMENT_ID=D.ID) ARRIBO
          , D.ESTIMATED_RESTORATION_TIME ESTIMACION
          , DECODE(C.LAST_STATE_ID,1,NULL,(SELECT MAX(EVENT_TIME) FROM NEXUS_GIS.OMS_AUDITORY WHERE FOREIGN_ID=D.ID AND AUDIT_TYPE<>1029)) REPOSICION
          , NULL OBSERVACIONES
          , NULL FECHA_INTERRUPCION
          , NULL ID_INTER
          , (SELECT DESCRIPTION FROM NEXUS_GIS.OMS_CLAIM_STATE WHERE ID=C.LAST_STATE_ID) ESTADO
      FROM 
          NEXUS_GIS.OMS_CLAIM C 
          , NEXUS_GIS.OMS_DOCUMENT D
      WHERE 
          C.DOCUMENT_ID=D.ID(+)
          AND C.PROPERTY_VALUE='8556214039' 
          AND C.TYPE_ID IN (102, 103)
          AND C.LAST_STATE_ID=1
      ORDER BY
          C.DOCUMENT_ID
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}
