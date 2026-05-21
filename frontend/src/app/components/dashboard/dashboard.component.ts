import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { MqttService } from '../../services/mqtt.service';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { SensorReading } from '../../models/sensor.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  readings: SensorReading[] = [];
  latestReading: SensorReading | null = null;
  mqttStatus = 'offline';
  wsConnected = false;
  private subscriptions: Subscription[] = [];
  private pollingSubscription: Subscription | null = null;

  constructor(
    private mqttService: MqttService,
    private apiService: ApiService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.mqttService.readings$.subscribe((readings) => {
        this.readings = readings;
        this.latestReading = readings[0] || this.latestReading;
      })
    );

    this.subscriptions.push(
      this.mqttService.status$.subscribe((status) => {
        this.mqttStatus = status;
      })
    );

    this.subscriptions.push(
      this.websocketService.lastReading$.subscribe((reading) => {
        if (reading) {
          this.readings = [reading, ...this.readings].slice(0, 50);
          this.latestReading = reading;
        }
      })
    );

    this.subscriptions.push(
      this.websocketService.connected$.subscribe((connected) => {
        this.wsConnected = connected;
      })
    );

    this.apiService.getLatestReadings(10).subscribe((readings) => {
      this.readings = readings;
      this.latestReading = readings[0] || null;
    });

    this.pollingSubscription = interval(5000).subscribe(() => {
      this.apiService.getLatestReadings(1).subscribe((readings) => {
        if (readings.length > 0) {
          this.latestReading = readings[0];
          this.readings = [readings[0], ...this.readings].slice(0, 50);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
