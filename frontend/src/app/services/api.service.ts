import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SensorReading, HistoricalReading } from '../models/sensor.model';
import { ApiAlert, UserConfig } from '../models/config.model';

function toSensorReading(item: any): SensorReading {
  return {
    id: item.id,
    sensorId: item.sensor_id,
    timestamp: item.timestamp,
    temperature: Number(item.temperature),
    ph: Number(item.ph),
    waterLevel: Number(item.water_level),
    salinity: Number(item.salinity)
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLatestReadings(limit = 20): Observable<SensorReading[]> {
    return this.http.get<any[]>(`${this.baseUrl}/readings/latest`, {
      params: new HttpParams().set('limit', String(limit))
    }).pipe(
      map(items => items.map(toSensorReading))
    );
  }

  getHistoricalReadings(params?: {
    startDate?: string;
    endDate?: string;
    parameter?: string;
    sensorId?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }): Observable<HistoricalReading[]> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.parameter) httpParams = httpParams.set('parameter', params.parameter);
    if (params?.sensorId) httpParams = httpParams.set('sensorId', params.sensorId);
    if (params?.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<HistoricalReading[]>(`${this.baseUrl}/readings/history`, { params: httpParams });
  }

  getAlerts(params?: {
    type?: string;
    parameter?: string;
    startDate?: string;
    endDate?: string;
    sensorId?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Observable<{ data: ApiAlert[]; total: number }> {
    let httpParams = new HttpParams();
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.parameter) httpParams = httpParams.set('parameter', params.parameter);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.sensorId) httpParams = httpParams.set('sensorId', params.sensorId);
    if (params?.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.offset != null) httpParams = httpParams.set('offset', String(params.offset));
    return this.http.get<{ data: ApiAlert[]; total: number }>(`${this.baseUrl}/alerts`, { params: httpParams });
  }

  getConfig(): Observable<UserConfig | null> {
    return this.http.get<UserConfig | null>(`${this.baseUrl}/config`);
  }

  saveConfig(config: UserConfig): Observable<UserConfig> {
    return this.http.post<UserConfig>(`${this.baseUrl}/config`, config);
  }
}
