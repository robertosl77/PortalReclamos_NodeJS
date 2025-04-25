import dotenv from 'dotenv';
dotenv.config();

// Validamos que el valor esté entre los permitidos
const allowedEnvs = ['dv', 'qa', 'prod'];
const env = (process.env.APP_ENV || '').toLowerCase();

if (!allowedEnvs.includes(env)) {
  throw new Error(`[CONFIG] Valor APP_ENV no válido: "${env}". Usa uno de: ${allowedEnvs.join(', ')}`);
}

// Devuelve el identificador tipo: DDPP_APP_PRO
export const appIdentifier = `DDPP_APP_${env.toUpperCase()}`;
