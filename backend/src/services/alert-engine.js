const pool = require('../config/database');
const trendAnalytics = require('./trend-analytics');

const CRITICAL_RANGES = {
  temperature: { min: 23, max: 27 },
  ph: { min: 7.2, max: 7.8 },
  waterLevel: { min: 50, max: 60 },
  salinity: { min: 31, max: 33 }
};

async function getUserConfig() {
  const query = 'SELECT * FROM user_configs ORDER BY id DESC LIMIT 1';
  const { rows } = await pool.query(query);
  return rows[0] || null;
}

function buildCriticalAlerts(reading, config) {
  const ranges = config || CRITICAL_RANGES;
  const alerts = [];

  Object.entries({
    temperature: reading.temperature,
    ph: reading.ph,
    waterLevel: reading.waterLevel,
    salinity: reading.salinity
  }).forEach(([key, value]) => {
    const range = ranges[key] || CRITICAL_RANGES[key];
    if (value < range.min || value > range.max) {
      alerts.push({
        type: 'critical',
        parameter: key,
        currentValue: value,
        threshold: range,
        message: `El valor de ${key} está fuera del rango aceptable (${range.min} - ${range.max}).`
      });
    }
  });

  return alerts;
}

async function saveAlert(alertEntry) {
  const query = `
    INSERT INTO alerts (sensor_id, timestamp, type, parameter, value, message, extra_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`;

  const values = [
    alertEntry.sensorId,
    alertEntry.timestamp,
    alertEntry.type,
    alertEntry.parameter,
    alertEntry.value,
    alertEntry.message,
    JSON.stringify(alertEntry.extraData || {})
  ];
  await pool.query(query, values);
}

async function hasRecentPredictiveAlert(parameter, minutesWindow = 10) {
  const since = new Date(Date.now() - minutesWindow * 60 * 1000);
  const query = `
    SELECT id FROM alerts
    WHERE type = 'predictive' AND parameter = $1
    AND timestamp >= $2
    LIMIT 1`;
  const { rows } = await pool.query(query, [parameter, since]);
  return rows.length > 0;
}

async function evaluateReading(reading) {
  const userConfig = await getUserConfig();
  const configRanges = userConfig ? {
    temperature: { min: userConfig.temperature_min, max: userConfig.temperature_max },
    ph: { min: userConfig.ph_min, max: userConfig.ph_max },
    waterLevel: { min: userConfig.water_level_min, max: userConfig.water_level_max },
    salinity: { min: userConfig.salinity_min, max: userConfig.salinity_max }
  } : null;

  const criticalAlerts = buildCriticalAlerts(reading, configRanges);
  const alerts = [];
  for (const alert of criticalAlerts) {
    const entry = {
      sensorId: reading.sensorId,
      timestamp: reading.timestamp,
      type: alert.type,
      parameter: alert.parameter,
      value: alert.currentValue,
      message: alert.message,
      extraData: { threshold: alert.threshold }
    };
    try {
      await saveAlert(entry);
      alerts.push(entry);
    } catch (err) {
      console.error('[AlertEngine] Error guardando alerta crítica:', err.message);
    }
  }

  const predictiveAlerts = [];
  for (const parameter of ['temperature', 'ph', 'waterLevel', 'salinity']) {
    const trend = await trendAnalytics.predictTrend(parameter);
    if (!trend) continue;

    const range = configRanges ? configRanges[parameter] : CRITICAL_RANGES[parameter];
    const predictedValue = trend.predicted;

    if (predictedValue < range.min || predictedValue > range.max) {
      const recent = await hasRecentPredictiveAlert(parameter);
      if (recent) continue;

      predictiveAlerts.push({
        sensorId: reading.sensorId,
        timestamp: new Date(),
        type: 'predictive',
        parameter,
        value: predictedValue,
        message: `Tendencia predictiva indica que ${parameter} podría alcanzar ${predictedValue} en breve.`,
        extraData: { slope: trend.slope, window: trend.window }
      });
    }
  }

  for (const alert of predictiveAlerts) {
    try {
      await saveAlert(alert);
      alerts.push(alert);
    } catch (err) {
      console.error('[AlertEngine] Error guardando alerta predictiva:', err.message);
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  return { reading, alerts };
}

module.exports = {
  evaluateReading,
  getUserConfig,
  saveAlert
};
