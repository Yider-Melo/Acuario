import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HistoryComponent } from './components/history/history.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { ConfigComponent } from './components/config/config.component';
import { RealtimeChartComponent } from './components/charts/realtime-chart.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'alerts', component: AlertsComponent, data: { showAll: true } },
  { path: 'config', component: ConfigComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HistoryComponent,
    AlertsComponent,
    ConfigComponent,
    RealtimeChartComponent
  ],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
