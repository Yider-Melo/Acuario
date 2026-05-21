import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { WebsocketService } from '../../services/websocket.service';
import { ApiAlert } from '../../models/config.model';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: ApiAlert[] = [];
  total = 0;
  loading = false;
  private subscriptions: Subscription[] = [];

  filters = {
    type: '',
    parameter: '',
    startDate: '',
    endDate: '',
    sensorId: '',
    sortOrder: 'desc' as 'asc' | 'desc',
    limit: 50,
    offset: 0
  };

  constructor(
    private alertService: AlertService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.alertService.alerts$.subscribe((alerts) => {
        this.alerts = alerts;
        this.loading = false;
      })
    );

    this.subscriptions.push(
      this.alertService.total$.subscribe((total) => {
        this.total = total;
      })
    );

    this.subscriptions.push(
      this.websocketService.lastAlert$.subscribe((alert) => {
        if (alert) {
          this.addAlert(alert);
        }
      })
    );

    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    const params: any = { limit: this.filters.limit, offset: this.filters.offset };
    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.parameter) params.parameter = this.filters.parameter;
    if (this.filters.startDate) params.startDate = this.filters.startDate;
    if (this.filters.endDate) params.endDate = this.filters.endDate;
    if (this.filters.sensorId) params.sensorId = this.filters.sensorId;
    if (this.filters.sortOrder) params.sortOrder = this.filters.sortOrder;

    this.alertService.loadAlerts(params);
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      parameter: '',
      startDate: '',
      endDate: '',
      sensorId: '',
      sortOrder: 'desc',
      limit: 50,
      offset: 0
    };
    this.loadAlerts();
  }

  pageChanged(page: number): void {
    this.filters.offset = (page - 1) * this.filters.limit;
    this.loadAlerts();
  }

  get currentPage(): number {
    return Math.floor(this.filters.offset / this.filters.limit) + 1;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.filters.limit) || 1;
  }

  get showingFrom(): number {
    return this.filters.offset + 1;
  }

  get showingTo(): number {
    return Math.min(this.filters.offset + this.filters.limit, this.total);
  }

  private addAlert(alert: ApiAlert): void {
    this.alerts = [alert, ...this.alerts];
  }

  alertTypeClass(type: string): string {
    return type === 'critical' ? 'tag-critical' : 'tag-predictive';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
