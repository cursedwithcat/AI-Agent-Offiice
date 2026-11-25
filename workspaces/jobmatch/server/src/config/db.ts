import { DatabaseSync } from 'node:sqlite';
import { getDatabase, runTransaction, query, queryOne, execute, closeDatabase } from '../../../database/db.js';
import { ENV } from './env.js';

// Ensure the database connection uses the configured DB_PATH
process.env.DB_PATH = ENV.DB_PATH;

export {
  DatabaseSync,
  getDatabase,
  runTransaction,
  query,
  queryOne,
  execute,
  closeDatabase
};
