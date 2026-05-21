import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SensorReading } from '../../models/sensor.model';

Chart.register(...registerables);

@Component({
  selector: 'app-realtime-chart',
  template: `<div class="chart-shell"><canvas #chartCanvas></canvas></div>`,
  styles: [
    `.chart-shell { position: relative; width: 100%; height: 420px; }`
  ]
})
export class RealtimeChartComponent implements AfterViewInit, OnChanges {
  @Input() readings: SensorReading[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] && this.chart) {
      this.updateChart();
    }
  }

  initializeChart(): void {
    const context = this.chartCanvas.nativeElement.getContext('2d');
    if (!context) {
      return;
    }

    this.chart = new Chart(context, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Temperatura (°C)',
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.2)',
            fill: true,
            tension: 0.35,
            data: []
          },
          {
            label: 'pH',
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.2)',
            fill: true,
            tension: 0.35,
            data: []
          },
          {
            label: 'Salinidad (ppt)',
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20,184,166,0.2)',
            fill: true,
            tension: 0.35,
            data: []
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: true, title: { display: true, text: 'Tiempo' } },
          y: { display: true, beginAtZero: false }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    });
    this.updateChart();
  }

  updateChart(): void {
    if (!this.chart) {
      return;
    }

    const recent = [...this.readings].slice(0, 12).reverse();
    this.chart.data.labels = recent.map((reading) => new Date(reading.timestamp).toLocaleTimeString());
    this.chart.data.datasets[0].data = recent.map((reading) => reading.temperature);
    this.chart.data.datasets[1].data = recent.map((reading) => reading.ph);
    this.chart.data.datasets[2].data = recent.map((reading) => reading.salinity);
    this.chart.update();
  }
}
