const express = require('express');
const readingsController = require('../controllers/readingsController');
const alertsController = require('../controllers/alertsController');
const configController = require('../controllers/configController');

const router = express.Router();

router.get('/readings/latest', readingsController.getLatestReadings);
router.get('/readings/history', readingsController.getHistoricalReadings);
router.get('/alerts', alertsController.getAlerts);
router.get('/config', configController.getConfig);
router.post('/config', configController.saveConfig);

router.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

module.exports = router;
