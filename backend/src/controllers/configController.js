const pool = require('../config/database');

async function getConfig(req, res, next) {
  try {
    const query = 'SELECT * FROM user_configs ORDER BY id DESC LIMIT 1';
    const { rows } = await pool.query(query);
    res.json(rows[0] || null);
  } catch (error) {
    next(error);
  }
}

async function saveConfig(req, res, next) {
  try {
    const {
      temperature_min,
      temperature_max,
      ph_min,
      ph_max,
      water_level_min,
      water_level_max,
      salinity_min,
      salinity_max
    } = req.body;

    if (
      temperature_min == null || temperature_max == null ||
      ph_min == null || ph_max == null ||
      water_level_min == null || water_level_max == null ||
      salinity_min == null || salinity_max == null
    ) {
      return res.status(400).json({ error: 'Todos los rangos deben estar definidos.' });
    }

    const errors = [];

    if (Number(temperature_min) >= Number(temperature_max)) {
      errors.push('temperature_min debe ser menor que temperature_max');
    }
    if (Number(ph_min) >= Number(ph_max)) {
      errors.push('ph_min debe ser menor que ph_max');
    }
    if (Number(water_level_min) >= Number(water_level_max)) {
      errors.push('water_level_min debe ser menor que water_level_max');
    }
    if (Number(salinity_min) >= Number(salinity_max)) {
      errors.push('salinity_min debe ser menor que salinity_max');
    }

    if (Number(temperature_min) < 0 || Number(temperature_max) > 50) {
      errors.push('Temperatura debe estar entre 0 y 50');
    }
    if (Number(ph_min) < 0 || Number(ph_max) > 14) {
      errors.push('pH debe estar entre 0 y 14');
    }
    if (Number(water_level_min) < 0 || Number(water_level_max) > 200) {
      errors.push('Nivel de agua debe estar entre 0 y 200');
    }
    if (Number(salinity_min) < 0 || Number(salinity_max) > 50) {
      errors.push('Salinidad debe estar entre 0 y 50');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validación de rangos fallida', details: errors });
    }

    const query = `
      INSERT INTO user_configs (
        temperature_min, temperature_max,
        ph_min, ph_max,
        water_level_min, water_level_max,
        salinity_min, salinity_max,
        created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;

    const values = [
      Number(temperature_min), Number(temperature_max),
      Number(ph_min), Number(ph_max),
      Number(water_level_min), Number(water_level_max),
      Number(salinity_min), Number(salinity_max),
      new Date()
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getConfig,
  saveConfig
};
