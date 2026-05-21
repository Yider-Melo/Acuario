const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function migrate() {
  const sqlPath = path.resolve(__dirname, '../models/database.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  try {
    await pool.query(sql);
    console.log('[Migracion] Esquema de base de datos aplicado correctamente.');
  } catch (error) {
    console.error('[Migracion] Error aplicando esquema:', error.message);
    throw error;
  }
}

module.exports = migrate;
