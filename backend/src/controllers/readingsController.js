const pool = require('../config/database');

async function getLatestReadings(req, res, next) {
  const limit = Number(req.query.limit || 20);
  try {
    const query = `
      SELECT id, sensor_id, timestamp, temperature, ph, water_level, salinity
      FROM sensor_readings
      ORDER BY timestamp DESC
      LIMIT $1`;
    const { rows } = await pool.query(query, [limit]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function getHistoricalReadings(req, res, next) {
  const { startDate, endDate, parameter, sensorId, sortOrder, limit } = req.query;
  const allowed = { temperature: 'temperature', ph: 'ph', waterLevel: 'water_level', salinity: 'salinity' };
  const column = allowed[parameter] || null;

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

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
    const select = column ? `id, sensor_id, timestamp, ${column} AS value` : 'id, sensor_id, timestamp, temperature, ph, water_level, salinity';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const queryLimit = limit ? ` LIMIT ${parseInt(limit, 10)}` : '';

    const query = `SELECT ${select} FROM sensor_readings ${filter} ORDER BY timestamp ${order}${queryLimit}`;
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLatestReadings,
  getHistoricalReadings
};
