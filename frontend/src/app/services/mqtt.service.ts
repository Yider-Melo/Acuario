import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import mqtt from 'mqtt';
import { environment } from '../../environments/environment';
import { SensorReading } from '../models/sensor.model';

@Injectable({ providedIn: 'root' })
export class MqttService {
  private client: mqtt.MqttClient | null = null;
  public readings$ = new BehaviorSubject<SensorReading[]>([]);
  public status$ = new BehaviorSubject<string>('offline');

  constructor(private ngZone: NgZone) {
    if (!environment.mqttBroker) {
      console.log('[MQTT] Broker no configurado. Usando Socket.io como fuente de datos.');
      return;
    }
    this.connect();
  }

  connect(): void {
    if (!environment.mqttBroker) return;
    this.client = mqtt.connect(environment.mqttBroker, {
      connectTimeout: 30000,
      reconnectPeriod: 5000,
      clientId: `acuario-web-${Math.random().toString(16).slice(2)}`
    });

    this.client.on('connect', () => {
      this.ngZone.run(() => this.status$.next('connected'));
      this.client?.subscribe(environment.mqttTopic, { qos: 1 }, (err: any) => {
        if (err) {
          console.error('[MQTT] Error al suscribir:', err.message);
        } else {
          console.log('[MQTT] Suscrito a', environment.mqttTopic);
        }
      });
    });

    this.client.on('reconnect', () => {
      this.ngZone.run(() => this.status$.next('reconnecting'));
      console.warn('[MQTT] Reintentando conexión...');
    });

    this.client.on('error', (error: any) => {
      this.ngZone.run(() => this.status$.next('error'));
      console.error('[MQTT] Error:', error.message);
    });

    this.client.on('offline', () => {
      this.ngZone.run(() => this.status$.next('offline'));
      console.warn('[MQTT] Cliente offline.');
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      try {
        const payload = JSON.parse(message.toString());
        const reading: SensorReading = {
          sensorId: payload.sensorId || 'sensor-01',
          timestamp: payload.timestamp || new Date().toISOString(),
          temperature: Number(payload.temperature),
          ph: Number(payload.ph),
          waterLevel: Number(payload.waterLevel),
          salinity: Number(payload.salinity)
        };

        const current = this.readings$.value.slice(0, 49);
        const updated = [reading, ...current];
        this.ngZone.run(() => this.readings$.next(updated));
      } catch (err: any) {
        console.error('[MQTT] Error procesando mensaje:', err);
      }
    });
  }
}
