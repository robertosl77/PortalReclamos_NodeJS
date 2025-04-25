import { getConnection } from '../config/db.js';

export async function obtenerReclamos(req, res) {
  try {
    const connection = await getConnection();

    const result = await connection.execute(`
      SELECT CUENTA, MOTIVO, FECHA_INICIO, FECHA_FIN, ESTADO FROM RECLAMOS
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener reclamos:', err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
}
