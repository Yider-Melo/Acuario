import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { MqttService } from '../../services/mqtt.service';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { AlertService } from '../../services/alert.service';
import { SensorReading } from '../../models/sensor.model';
import { ApiAlert } from '../../models/config.model';

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

  notifications: ApiAlert[] = [];
  notificationsFilter: 'all' | 'critical' | 'predictive' = 'all';
  panelOpen = false;
  maxNotifications = 20;

  private subscriptions: Subscription[] = [];
  private pollingSubscription: Subscription | null = null;

  constructor(
    private mqttService: MqttService,
    private apiService: ApiService,
    private websocketService: WebsocketService,
    private alertService: AlertService
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

    this.subscriptions.push(
      this.websocketService.lastAlert$.subscribe((alert) => {
        if (alert) {
          this.notifications = [alert, ...this.notifications].slice(0, 200);
        }
      })
    );

    this.alertService.loadAlerts({ limit: 50, sortOrder: 'desc' });
    this.subscriptions.push(
      this.alertService.alerts$.subscribe((alerts) => {
        this.notifications = alerts;
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

  get filteredNotifications(): ApiAlert[] {
    if (this.notificationsFilter === 'all') return this.notifications.slice(0, this.maxNotifications);
    return this.notifications.filter((n) => n.type === this.notificationsFilter).slice(0, this.maxNotifications);
  }

  get unreadCount(): number {
    return this.notifications.length;
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  setFilter(filter: 'all' | 'critical' | 'predictive'): void {
    this.notificationsFilter = filter;
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  showMore(): void {
    this.maxNotifications += 20;
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
