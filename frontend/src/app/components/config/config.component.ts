import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UserConfig } from '../../models/config.model';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html'
})
export class ConfigComponent implements OnInit {
  config: UserConfig = {
    temperature_min: 22,
    temperature_max: 28,
    ph_min: 7,
    ph_max: 8,
    water_level_min: 30,
    water_level_max: 70,
    salinity_min: 30,
    salinity_max: 35
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getConfig().subscribe({
      next: (config) => {
        if (config) {
          this.config = config;
        }
      },
      error: (error) => {
        console.error('[ConfigComponent] Error cargando configuración:', error);
      }
    });
  }

  saveConfig(): void {
    this.api.saveConfig(this.config).subscribe({
      next: (saved) => {
        alert('Configuración guardada correctamente');
        this.config = saved;
      },
      error: (error) => {
        console.error('[ConfigComponent] Error guardando configuración:', error);
        alert('Error guardando configuración. Revisa la consola.');
      }
    });
  }
}
