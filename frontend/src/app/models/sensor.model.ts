export interface SensorReading {
  id?: number;
  sensorId: string;
  timestamp: string | Date;
  temperature: number;
  ph: number;
  waterLevel: number;
  salinity: number;
}

export interface HistoricalReading {
  id: number;
  sensor_id: string;
  timestamp: string;
  value?: number;
  temperature?: number;
  ph?: number;
  water_level?: number;
  salinity?: number;
}
