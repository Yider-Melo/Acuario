import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { ApiAlert } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertsSubject = new BehaviorSubject<ApiAlert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  constructor(private api: ApiService) {}

  loadAlerts(filters?: {
    type?: string;
    parameter?: string;
    startDate?: string;
    endDate?: string;
    sensorId?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }): void {
    this.api.getAlerts(filters).pipe(
      catchError((error) => {
        console.error('[AlertService] Error cargando alertas:', error);
        return of([]);
      })
    ).subscribe((alerts) => this.alertsSubject.next(alerts));
  }

  pushAlert(alert: ApiAlert): void {
    const current = this.alertsSubject.value.slice(0, 49);
    this.alertsSubject.next([alert, ...current]);
  }
}
