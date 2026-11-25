import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'jobmatch_jwt_production_secret_key_2026_royal_blue')) {
  throw new Error('[CRITICAL SECURITY ERROR] Insecure JWT_SECRET in production! You must supply a strong unique JWT_SECRET environment variable.');
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET || 'jobmatch_jwt_production_secret_key_2026_royal_blue',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3001',
  DB_PATH: process.env.DB_PATH || path.resolve(__dirname, '../../../database/jobmatch.db'),
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads/resumes')
};
