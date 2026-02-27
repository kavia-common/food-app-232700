const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");

const DB_PATH = path.join(process.cwd(), "data", "app.db");

function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * PUBLIC_INTERFACE
 * Returns an opened sqlite3.Database instance (serialized mode).
 * @returns {sqlite3.Database}
 */
function getDb() {
  ensureDataDir();
  sqlite3.verbose();
  return new sqlite3.Database(DB_PATH);
}

/**
 * PUBLIC_INTERFACE
 * Run a SQL statement (no results).
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<{ lastID: number, changes: number }>}
 */
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * PUBLIC_INTERFACE
 * Get a single row.
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any>}
 */
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * PUBLIC_INTERFACE
 * Get all rows.
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any[]>}
 */
function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { getDb, run, get, all, DB_PATH };
