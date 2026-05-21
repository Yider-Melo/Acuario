const pool = require('../config/database');
const { createClient } = require('../config/mqtt');
const alertEngine = require('./alert-engine');

let mqttClient;

async function persistReading(reading) {
  const query = `
    INSERT INTO sensor_readings (sensor_id, timestamp, temperature, ph, water_level, salinity)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`;

  const values = [
    reading.sensorId,
    reading.timestamp,
    reading.temperature,
    reading.ph,
    reading.waterLevel,
    reading.salinity
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

function parsePayload(topic, payload) {
  try {
    const data = JSON.parse(payload.toString());
    return {
      sensorId: data.sensorId || 'sensor-01',
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      temperature: Number(data.temperature),
      ph: Number(data.ph),
      waterLevel: Number(data.waterLevel),
      salinity: Number(data.salinity)
    };
  } catch (error) {
    console.error('[MQTT Listener] Error parseando payload:', error.message);
    return null;
  }
}

async function handleMessage(io, topic, payload) {
  console.log('[MQTT Listener] Mensaje recibido:', topic, payload.toString());
  const reading = parsePayload(topic, payload);
  if (!reading || Number.isNaN(reading.temperature) || Number.isNaN(reading.ph)) {
    console.warn('[MQTT Listener] Lectura inválida descartada.', topic);
    return;
  }

  try {
    const saved = await persistReading(reading);
    const alert = await alertEngine.evaluateReading(reading);

    io.emit('sensor-reading', { ...reading, id: saved.id });
    if (alert && alert.alerts.length > 0) {
      alert.alerts.forEach(a => io.emit('sensor-alert', a));
    }

    console.log('[MQTT Listener] Lectura registrada:', saved.id);
  } catch (error) {
    console.error('[MQTT Listener] Error almacenando lectura:', error.message);
  }
}

async function initialize(io) {
  mqttClient = createClient();
  mqttClient.on('message', async (topic, payload) => {
    await handleMessage(io, topic, payload);
  });
}

module.exports = {
  initialize,
  handleMessage
};
