import { getConnection } from '../config/db.js';

export async function obtenerReclamosActivos(req, res) {

  const { cuenta } = req.params;

  if (!cuenta) {
    return res.status(400).json({ error: 'Debe especificar una cuenta' });
  }

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
          AND C.PROPERTY_VALUE=:cuenta
          AND C.TYPE_ID IN (102, 103)
          AND C.LAST_STATE_ID=1
      ORDER BY
          C.DOCUMENT_ID
    `, [cuenta] // ← parámetro seguro
    );

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
          , (SELECT CLOSING_TIME FROM NEXUS_GIS.OMS_CLAIM_CLOSE WHERE ID=C.CLOSE_INFO_ID) REPOSICION
          , (SELECT 'Actividad:'||NVL((SELECT DESCRIPTION FROM NEXUS_GIS.OMS_TASK_TYPE WHERE ID IN (SELECT TYPE_ID FROM NEXUS_GIS.OMS_TASK WHERE DOCUMENT_ID=C.DOCUMENT_ID AND ROWNUM=1)),'-')||'>'||'Instalacion:'||NVL(IT.DESCRIPTION,'-')||'>'||'Causa:'||NVL(FT.DESCRIPTION,'-') OBSERVACIONES FROM NEXUS_GIS.OMS_DOCUMENT_CAUSE DC,NEXUS_GIS.OMS_INSTALLATION_TYPE IT,NEXUS_GIS.OMS_FAILURE_TYPE FT WHERE DC.DOCUMENT_ID=C.DOCUMENT_ID AND DC.FAILURE_TYPE_ID=FT.ID(+) AND DC.INSTALLATION_TYPE_ID=IT.ID(+) AND ROWNUM=1) OBSERVACIONES
          , SISENRE.GET_FECHA_REC@SISENRE(C.NAME) FECHA_INTERRUPCION
          , SISENRE.GET_INTERRUPCION_REC@SISENRE(C.NAME) ID_INTER
          , (SELECT DESCRIPTION FROM NEXUS_GIS.OMS_CLAIM_STATE WHERE ID=C.LAST_STATE_ID) ESTADO
      FROM 
          NEXUS_GIS.OMS_CLAIM C 
          , NEXUS_GIS.OMS_DOCUMENT D
      WHERE 
          C.DOCUMENT_ID=D.ID(+)
          AND C.PROPERTY_VALUE=:cuenta
          AND C.TYPE_ID IN (102, 103)
          AND C.LAST_STATE_ID>1
      ORDER BY
          C.DOCUMENT_ID DESC
    `, [cuenta] // ← parámetro seguro
    );

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

    const result = await connection.execute(`
      SELECT COUNT(1) FROM NEXUS_GIS.SPRCLIENTS WHERE FSCLIENTID=:cuenta
    `, [cuenta] // ← parámetro seguro
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos cerrados:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}

export async function datosCliente(req, res) {

  const { cuenta } = req.params;

  if (!cuenta) {
    return res.status(400).json({ error: 'Debe especificar una cuenta' });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(`
      SELECT 
          FSCLIENTID CUENTA 
          , FULLNAME TITULAR 
          , (SELECT TRIM(STREETNAME) FROM NEXUS_GIS.SMSTREETS WHERE STREETID=C.STREETID AND ROWNUM=1) CALLE 
          , STREETNUMBER ALTURA 
          , TRIM(STREETOTHER) PISODPTO 
          , (SELECT TRIM(STREETNAME) FROM NEXUS_GIS.SMSTREETS WHERE STREETID=C.STREETID1 AND ROWNUM=1) ECALLE1 
          , (SELECT TRIM(STREETNAME) FROM NEXUS_GIS.SMSTREETS WHERE STREETID=C.STREETID2 AND ROWNUM=1) ECALLE2 
          , (SELECT TRIM(AREANAME) FROM NEXUS_GIS.AMAREAS WHERE AREAID = C.LEVELONEAREAID AND ROWNUM=1) LOCALIDAD 
          , (SELECT TRIM(AREANAME) FROM NEXUS_GIS.AMAREAS WHERE AREAID = C.LEVELTWOAREAID AND ROWNUM=1) PARTIDO 
          , (SELECT PHONENUMBER FROM NEXUS_GIS.DSCCCLIENTPHONES WHERE FSCLIENTID=C.FSCLIENTID AND ISCONTACT=1) TELEFONO 
          , DECODE(LOGIDTO,0,'ACTIVO','TERMINADO') ESTADO_CLIENTE 
      FROM 
          NEXUS_GIS.SPRCLIENTS C 
      WHERE 
          FSCLIENTID=:cuenta
    `, [cuenta] // ← parámetro seguro
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos cerrados:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}