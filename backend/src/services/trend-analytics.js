const pool = require('../config/database');

function linearRegression(values) {
  const n = values.length;
  if (n < 2) {
    return null;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i += 1) {
    const x = i + 1;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

async function fetchRecentValues(sensor, limit = 8) {
  const validColumns = {
    temperature: 'temperature',
    ph: 'ph',
    waterLevel: 'water_level',
    salinity: 'salinity'
  };

  const column = validColumns[sensor];
  if (!column) {
    throw new Error(`Parámetro no válido para análisis de tendencias: ${sensor}`);
  }

  const query = `
    SELECT ${column} AS value
    FROM sensor_readings
    WHERE ${column} IS NOT NULL
    ORDER BY timestamp DESC
    LIMIT $1`;
  const { rows } = await pool.query(query, [limit]);
  return rows.map((row) => Number(row.value)).reverse();
}

async function predictTrend(sensor) {
  const values = await fetchRecentValues(sensor);
  const regression = linearRegression(values);
  if (!regression) {
    return null;
  }

  const nextIndex = values.length + 1;
  const predicted = regression.intercept + regression.slope * nextIndex;
  return {
    sensor,
    slope: regression.slope,
    predicted: Number(predicted.toFixed(2)),
    window: values.length
  };
}

module.exports = {
  predictTrend,
  linearRegression,
  fetchRecentValues
};
