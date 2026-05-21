const pool = require('../config/database');

async function getAlerts(req, res, next) {
  try {
    const query = `
      SELECT id, sensor_id, timestamp, type, parameter, value, message, extra_data
      FROM alerts
      ORDER BY timestamp DESC`;
    const { rows } = await pool.query(query);
    res.json(rows.map((row) => ({ ...row, extra_data: row.extra_data ? JSON.parse(row.extra_data) : {} })));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlerts
};
