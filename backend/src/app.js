const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const mqttListener = require('./services/mqtt-listener');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
  console.error('[Express Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

io.on('connection', (socket) => {
  console.log('[Socket.io] Cliente conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('[Socket.io] Cliente desconectado:', socket.id);
  });
});

mqttListener.initialize(io).catch((err) => {
  console.error('[MQTT Listener] Error inicializando:', err.message);
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
  console.log(`Socket.io habilitado en el mismo servidor`);
});
