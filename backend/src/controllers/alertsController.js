const pool = require('../config/database');

async function getAlerts(req, res, next) {
  const { type, parameter, startDate, endDate, sensorId, sortOrder, limit } = req.query;

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (type) {
      conditions.push(`type = $${idx++}`);
      values.push(type);
    }
    if (parameter) {
      conditions.push(`parameter = $${idx++}`);
      values.push(parameter);
    }
    if (startDate) {
      conditions.push(`timestamp >= $${idx++}`);
      values.push(new Date(startDate));
    }
    if (endDate) {
      conditions.push(`timestamp <= $${idx++}`);
      values.push(new Date(endDate));
    }
    if (sensorId) {
      conditions.push(`sensor_id = $${idx++}`);
      values.push(sensorId);
    }

    const filter = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const queryLimit = limit ? ` LIMIT ${parseInt(limit, 10)}` : '';

    const query = `
      SELECT id, sensor_id, timestamp, type, parameter, value, message, extra_data
      FROM alerts ${filter}
      ORDER BY timestamp ${order}${queryLimit}`;

    const { rows } = await pool.query(query, values);
    res.json(rows.map((row) => ({ ...row, extra_data: row.extra_data ? JSON.parse(row.extra_data) : {} })));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlerts
};
