const mqtt = require('mqtt');
const dotenv = require('dotenv');

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const clientId = process.env.MQTT_CLIENT_ID || `acuario-iot-${Math.random().toString(16).slice(2)}`;
const topic = process.env.MQTT_TOPIC || 'acuario/sensores/#';

const options = {
  clientId,
  reconnectPeriod: 5000,
  clean: true,
  connectTimeout: 30 * 1000
};

function createClient() {
  const client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('[MQTT] Conectado a broker', brokerUrl);
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Error suscribiendo a tópico:', err.message);
      } else {
        console.log('[MQTT] Suscrito al tópico', topic);
      }
    });
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Reintentando conexión...');
  });

  client.on('error', (err) => {
    console.error('[MQTT] Error de conexión:', err.message);
  });

  client.on('offline', () => {
    console.warn('[MQTT] Cliente offline. Verifique el broker.');
  });

  return client;
}

module.exports = {
  createClient,
  topic
};
