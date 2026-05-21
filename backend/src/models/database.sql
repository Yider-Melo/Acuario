-- Esquema de la base de datos para el sistema de monitoreo de acuario IoT

CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature NUMERIC(6,2) NOT NULL,
  ph NUMERIC(5,2) NOT NULL,
  water_level NUMERIC(6,2) NOT NULL,
  salinity NUMERIC(6,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type VARCHAR(32) NOT NULL,
  parameter VARCHAR(32) NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  message TEXT NOT NULL,
  extra_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);

CREATE TABLE IF NOT EXISTS user_configs (
  id SERIAL PRIMARY KEY,
  temperature_min NUMERIC(6,2) NOT NULL,
  temperature_max NUMERIC(6,2) NOT NULL,
  ph_min NUMERIC(5,2) NOT NULL,
  ph_max NUMERIC(5,2) NOT NULL,
  water_level_min NUMERIC(6,2) NOT NULL,
  water_level_max NUMERIC(6,2) NOT NULL,
  salinity_min NUMERIC(6,2) NOT NULL,
  salinity_max NUMERIC(6,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO user_configs (
  temperature_min, temperature_max,
  ph_min, ph_max,
  water_level_min, water_level_max,
  salinity_min, salinity_max
) VALUES (22.0, 28.0, 7.0, 8.0, 30.0, 70.0, 30.0, 35.0)
ON CONFLICT DO NOTHING;
