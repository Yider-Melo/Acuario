import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { WebsocketService } from '../../services/websocket.service';
import { ApiAlert } from '../../models/config.model';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {
  @Input() showAll?: boolean;
  alerts: ApiAlert[] = [];
  showAllAlerts: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private alertService: AlertService,
    private websocketService: WebsocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const routeShowAll = this.route.snapshot.data['showAll'] === true;
    this.showAllAlerts = (this.showAll ?? routeShowAll) || this.router.url === '/alerts';

    this.alertService.loadAlerts();
    this.subscriptions.push(
      this.alertService.alerts$.subscribe((alerts) => {
        this.updateAlerts(alerts);
      })
    );

    this.subscriptions.push(
      this.websocketService.lastAlert$.subscribe((alert) => {
        if (!alert) {
          return;
        }

        if (this.showAllAlerts) {
          this.addAlert(alert);
        } else if (alert.type === 'critical') {
          this.alerts = [alert];
        }
      })
    );
  }

  private updateAlerts(allAlerts: ApiAlert[]): void {
    if (this.showAllAlerts) {
      this.alerts = allAlerts;
    } else {
      const criticalAlerts = allAlerts.filter(alert => alert.type === 'critical');
      this.alerts = criticalAlerts.length > 0 ? [criticalAlerts[0]] : [];
    }
  }

  private addAlert(alert: ApiAlert): void {
    this.alerts = [alert, ...this.alerts];
  }

  toggleShowAll(): void {
    if (this.router.url === '/alerts') {
      this.showAllAlerts = !this.showAllAlerts;
      this.alertService.loadAlerts();
      return;
    }

    this.router.navigate(['/alerts']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
