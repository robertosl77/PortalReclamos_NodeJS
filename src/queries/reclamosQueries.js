export const QUERY_RECLAMOS_ACTIVOS = `
  SELECT 
    D.ID DOCUMENT_ID,
    D.NAME NRO_DOCUMENTO,
    C.PROPERTY_VALUE CUENTA,
    C.ID RECLAMO_ID,
    C.NAME RECLAMO,
    SUBSTR(C.NAME, INSTR(C.NAME, '-', -1) + 1) AS RECLAMO_NRO,
    (SELECT DESCRIPTION FROM NEXUS_GIS.FDL_CLAIM_TYPE WHERE ID=C.TYPE_ID) TIPO,
    D.OUTAGE_TIME INICIO_AFECTACION,
    C.CUSTOMER_TIME INICIO_RECLAMO,
    (SELECT MIN(DISPATCH_TIME) FROM NEXUS_GIS.OMS_DISPATCH WHERE STATE_ID<>4 AND DOCUMENT_ID=D.ID) DESPACHO,
    (SELECT MIN(ARRIVAL_TIME) FROM NEXUS_GIS.OMS_DISPATCH WHERE STATE_ID<>4 AND DOCUMENT_ID=D.ID) ARRIBO,
    D.ESTIMATED_RESTORATION_TIME ESTIMACION,
    DECODE(C.LAST_STATE_ID,1,NULL,(SELECT MAX(EVENT_TIME) FROM NEXUS_GIS.OMS_AUDITORY WHERE FOREIGN_ID=D.ID AND AUDIT_TYPE<>1029)) REPOSICION,
    NULL OBSERVACIONES,
    NULL FECHA_INTERRUPCION,
    NULL ID_INTER,
    (SELECT DESCRIPTION FROM NEXUS_GIS.OMS_CLAIM_STATE WHERE ID=C.LAST_STATE_ID) ESTADO
  FROM 
    NEXUS_GIS.OMS_CLAIM C,
    NEXUS_GIS.OMS_DOCUMENT D
  WHERE 
    C.DOCUMENT_ID=D.ID(+)
    AND C.PROPERTY_VALUE = :cuenta
    AND C.TYPE_ID IN (102, 103)
    AND C.LAST_STATE_ID = 1
  ORDER BY C.DOCUMENT_ID
`;

export const QUERY_RECLAMOS_CERRADOS = `
  SELECT 
    D.ID DOCUMENT_ID,
    D.NAME NRO_DOCUMENTO,
    C.PROPERTY_VALUE CUENTA,
    C.ID RECLAMO_ID,
    C.NAME RECLAMO,
    SUBSTR(C.NAME, INSTR(C.NAME, '-', -1) + 1) AS RECLAMO_NRO,
    (SELECT DESCRIPTION FROM NEXUS_GIS.FDL_CLAIM_TYPE WHERE ID=C.TYPE_ID) TIPO,
    D.OUTAGE_TIME INICIO_AFECTACION,
    C.CUSTOMER_TIME INICIO_RECLAMO,
    (SELECT MIN(DISPATCH_TIME) FROM NEXUS_GIS.OMS_DISPATCH WHERE STATE_ID<>4 AND DOCUMENT_ID=D.ID) DESPACHO,
    (SELECT MIN(ARRIVAL_TIME) FROM NEXUS_GIS.OMS_DISPATCH WHERE STATE_ID<>4 AND DOCUMENT_ID=D.ID) ARRIBO,
    D.ESTIMATED_RESTORATION_TIME ESTIMACION,
    DECODE(C.LAST_STATE_ID,1,NULL,(SELECT MAX(EVENT_TIME) FROM NEXUS_GIS.OMS_AUDITORY WHERE FOREIGN_ID=D.ID AND AUDIT_TYPE<>1029)) REPOSICION,
    NULL OBSERVACIONES,
    NULL FECHA_INTERRUPCION,
    NULL ID_INTER,
    (SELECT DESCRIPTION FROM NEXUS_GIS.OMS_CLAIM_STATE WHERE ID=C.LAST_STATE_ID) ESTADO
  FROM 
    NEXUS_GIS.OMS_CLAIM C,
    NEXUS_GIS.OMS_DOCUMENT D
  WHERE 
    C.DOCUMENT_ID=D.ID(+)
    AND C.PROPERTY_VALUE = :cuenta
    AND C.TYPE_ID IN (102, 103)
    AND C.LAST_STATE_ID > 1
  ORDER BY C.DOCUMENT_ID
`;

export const QUERY_VALIDA_CUENTA = `
  SELECT COUNT(1) FROM NEXUS_GIS.SPRCLIENTS WHERE FSCLIENTID=:cuenta
`;

export const QUERY_BUSCA_CLIENTE = `
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
`;