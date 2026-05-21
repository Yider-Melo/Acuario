export interface UserConfig {
  id?: number;
  temperature_min: number;
  temperature_max: number;
  ph_min: number;
  ph_max: number;
  water_level_min: number;
  water_level_max: number;
  salinity_min: number;
  salinity_max: number;
  created_at?: string;
}

export interface ApiAlert {
  id?: number;
  sensor_id: string;
  timestamp: string;
  type: string;
  parameter: string;
  value: number;
  message: string;
  extra_data: any;
}
