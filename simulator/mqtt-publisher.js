const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');

const configPath = path.resolve(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const client = mqtt.connect(config.brokerUrl, {
  clientId: `acuario-simulator-${Math.random().toString(16).slice(2)}`,
  reconnectPeriod: 5000,
  connectTimeout: 30000
});

const state = {
  temperature: config.baseValues.temperature,
  ph: config.baseValues.ph,
  waterLevel: config.baseValues.waterLevel,
  salinity: config.baseValues.salinity
};

const midpoints = {
  temperature: 25,
  ph: 7.5,
  waterLevel: 50,
  salinity: 32
};

function randomNoise(range) {
  return (Math.random() * range * 2 - range);
}

function reversion(key, value) {
  const mp = midpoints[key];
  const diff = value - mp;
  const strength = config.reversion[key] || 0;
  if (diff === 0 || strength === 0) return 0;
  if (Math.random() < strength * Math.abs(diff)) {
    return -Math.sign(diff) * (0.3 + Math.random() * 0.7);
  }
  return 0;
}

function advanceTrend() {
  Object.keys(state).forEach((key) => {
    const trend = config.trends[key];
    const noise = config.noise[key];
    const revert = reversion(key, state[key]);
    state[key] = Number((state[key] + trend + randomNoise(noise) + revert).toFixed(2));
  });
}

function buildPayload() {
  return JSON.stringify({
    sensorId: 'sensor-01',
    timestamp: new Date().toISOString(),
    temperature: state.temperature,
    ph: state.ph,
    waterLevel: state.waterLevel,
    salinity: state.salinity
  });
}

client.on('connect', () => {
  console.log('[Simulador] Conectado a broker MQTT:', config.brokerUrl);
  setInterval(() => {
    advanceTrend();
    const payload = buildPayload();
    client.publish(config.topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('[Simulador] Error publicando:', err.message);
      } else {
        console.log('[Simulador] Mensaje publicado:', payload);
      }
    });
  }, config.intervalMs);
});

client.on('reconnect', () => {
  console.log('[Simulador] Reintentando conexión...');
});

client.on('error', (error) => {
  console.error('[Simulador] Error MQTT:', error.message);
});
