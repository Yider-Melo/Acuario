import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { HistoricalReading } from '../../models/sensor.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  history: HistoricalReading[] = [];
  loading = false;
  loaded = false;

  filters = {
    startDate: '',
    endDate: '',
    parameter: '',
    sensorId: '',
    sortOrder: 'desc' as 'asc' | 'desc',
    limit: 100
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    const params: any = {};
    if (this.filters.startDate) params.startDate = this.filters.startDate;
    if (this.filters.endDate) params.endDate = this.filters.endDate;
    if (this.filters.parameter) params.parameter = this.filters.parameter;
    if (this.filters.sensorId) params.sensorId = this.filters.sensorId;
    if (this.filters.sortOrder) params.sortOrder = this.filters.sortOrder;
    if (this.filters.limit) params.limit = this.filters.limit;

    this.api.getHistoricalReadings(params).subscribe({
      next: (data) => {
        this.history = data;
        this.loaded = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('[HistoryComponent] Error cargando histórico:', error);
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      parameter: '',
      sensorId: '',
      sortOrder: 'desc',
      limit: 100
    };
    this.loadHistory();
  }
}
