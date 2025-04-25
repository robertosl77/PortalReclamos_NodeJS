import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

export async function getConnection() {
  try {
    return await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });
  } catch (err) {
    console.error('❌ Error al conectar a Oracle:', err);
    throw err;
  }
}
