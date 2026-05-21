import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { SensorReading } from '../models/sensor.model';
import { ApiAlert } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket: Socket;
  public connected$ = new BehaviorSubject<boolean>(false);
  public lastReading$ = new BehaviorSubject<SensorReading | null>(null);
  public lastAlert$ = new BehaviorSubject<ApiAlert | null>(null);

  constructor(private ngZone: NgZone) {
    this.socket = io(environment.socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000
    });

    this.socket.on('connect', () => {
      this.ngZone.run(() => this.connected$.next(true));
      console.log('[WebSocket] Conectado al servidor');
    });

    this.socket.on('disconnect', () => {
      this.ngZone.run(() => this.connected$.next(false));
      console.warn('[WebSocket] Desconectado del servidor. Reintentando...');
    });

    this.socket.on('sensor-reading', (payload: SensorReading) => {
      this.ngZone.run(() => this.lastReading$.next(payload));
    });

    this.socket.on('sensor-alert', (payload: ApiAlert) => {
      this.ngZone.run(() => this.lastAlert$.next(payload));
    });
  }
}
