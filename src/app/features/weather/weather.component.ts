import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  city = localStorage.getItem('zahra_governorate') || 'Tunis';
  currentWeather: any = null;
  forecast: any[] = [];
  weatherAlerts: any[] = [];
  siroccoRisk: any = null;
  isLoading = true;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    forkJoin({
      current:  this.weatherService.getCurrentWeather(this.city),
      forecast: this.weatherService.getForecast(this.city),
      alerts:   this.weatherService.getAlerts(this.city),
      sirocco:  this.weatherService.getSiroccoRisk(this.city),
    }).subscribe({
      next: (r: any) => {
        this.currentWeather = r.current;
        this.forecast       = r.forecast?.forecast || [];
        this.weatherAlerts  = r.alerts?.alerts || [];
        this.siroccoRisk    = r.sirocco;
        this.isLoading      = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getWeatherIcon(code: number): string {
    return '';
  }
}