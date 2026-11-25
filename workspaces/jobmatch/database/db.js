import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
/**
 * Jobmatch Database Connection & Persistence Client
 * Author: Vikram Patel, Database & Data Architect
 * Engine: Node.js Native SQLite (DatabaseSync)
 * Performance Settings: WAL journal mode, Synchronous NORMAL, Foreign Keys Enforced
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = process.env.DB_PATH || path.resolve(__dirname, 'jobmatch.db');
let instance = null;
/**
 * Returns the singleton DatabaseSync connection instance with all integrity PRAGMAs configured.
 */
export function getDatabase(customPath) {
    if (!instance || customPath) {
        const targetPath = customPath || DB_FILE_PATH;
        const dbDir = path.dirname(targetPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        const db = new DatabaseSync(targetPath);
        // Enforce critical data integrity and performance PRAGMAs
        db.exec('PRAGMA foreign_keys = ON;');
        db.exec('PRAGMA journal_mode = WAL;');
        db.exec('PRAGMA synchronous = NORMAL;');
        db.exec('PRAGMA busy_timeout = 5000;');
        if (!customPath) {
            instance = db;
        }
        else {
            return db;
        }
    }
    return instance;
}
/**
 * Executes a callback within an immediate transaction block.
 * Automatically rolls back upon any error and commits upon successful completion.
 */
export function runTransaction(callback, customDb) {
    const db = customDb || getDatabase();
    db.exec('BEGIN IMMEDIATE;');
    try {
        const result = callback(db);
        db.exec('COMMIT;');
        return result;
    }
    catch (error) {
        db.exec('ROLLBACK;');
        throw error;
    }
}
/**
 * Query helper: Returns an array of typed row objects.
 */
export function query(sql, params = []) {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    return stmt.all(...params);
}
/**
 * Query helper: Returns a single typed row object, or null if no row found.
 */
export function queryOne(sql, params = []) {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    return result ?? null;
}
/**
 * Execution helper: Runs an INSERT, UPDATE, or DELETE query and returns execution metadata.
 */
export function execute(sql, params = []) {
    const db = getDatabase();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
}
/**
 * Closes the active database connection.
 */
export function closeDatabase() {
    if (instance) {
        instance.close();
        instance = null;
    }
}
