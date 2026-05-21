import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UserConfig } from '../../models/config.model';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  config: UserConfig = {
    temperature_min: 23,
    temperature_max: 27,
    ph_min: 7.2,
    ph_max: 7.8,
    water_level_min: 50,
    water_level_max: 60,
    salinity_min: 31,
    salinity_max: 33
  };

  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  validationErrors: string[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getConfig().subscribe({
      next: (config) => {
        if (config) {
          this.config = config;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar la configuración actual.';
      }
    });
  }

  saveConfig(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.validationErrors = [];

    this.api.saveConfig(this.config).subscribe({
      next: (saved) => {
        this.config = saved;
        this.saving = false;
        this.successMessage = 'Configuración guardada correctamente.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        if (err.error?.details) {
          this.validationErrors = err.error.details;
        } else {
          this.errorMessage = err.error?.error || 'Error al guardar la configuración.';
        }
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.validationErrors = [];
  }
}
