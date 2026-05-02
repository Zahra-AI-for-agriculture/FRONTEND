const fs = require('fs');
const path = require('path');

const cleanEmojis = (str) => {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2139}\u{2192}\u{2193}\u{2191}\u{2714}\u{274C}\u{FE0F}\u{200D}\u{2B55}\u{2705}]/gu, '');
};

const components = {
  'weather': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { WeatherService } from '../../../services/weather.service';

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
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Météo</h1>
    <p class="page-sub">{{ city }} — Tunisie | طقس اليوم</p>
  </div>

  <div class="loading-state" *ngIf="isLoading">
    <div class="spin"></div>
    <p>Chargement météo...</p>
  </div>

  <ng-container *ngIf="!isLoading">

    <!-- Météo actuelle -->
    <div class="weather-hero" *ngIf="currentWeather">
      <div class="weather-big">
        <div class="weather-temp-big">
          {{ currentWeather.temperature }}°C
        </div>
        <div class="weather-desc-big">
          {{ currentWeather.description_fr }}
          <span class="weather-desc-ar">
            / {{ currentWeather.description_ar }}
          </span>
        </div>
      </div>
      <div class="weather-details-row">
        <div class="wd-item">
          <span class="wd-icon"></span>
          <span class="wd-val">{{ currentWeather.humidity }}%</span>
          <span class="wd-lbl">Humidité / رطوبة</span>
        </div>
        <div class="wd-item">
          <span class="wd-icon"></span>
          <span class="wd-val">{{ currentWeather.wind_speed_kmh }} km/h</span>
          <span class="wd-lbl">Vent / رياح</span>
        </div>
        <div class="wd-item">
          <span class="wd-icon"></span>
          <span class="wd-val">{{ currentWeather.precipitation_mm || 0 }} mm</span>
          <span class="wd-lbl">Pluie / أمطار</span>
        </div>
      </div>
    </div>

    <!-- Risque Sirocco -->
    <div class="sirocco-card"
         *ngIf="siroccoRisk"
         [class.risk-high]="siroccoRisk.risk_level === 'élevé'"
         [class.risk-low]="siroccoRisk.risk_level === 'faible'">
      <div class="sirocco-header">
        <span class="sirocco-icon"></span>
        <div>
          <h3>Risque Sirocco / خطر الشهيلي</h3>
          <p>{{ siroccoRisk.message_fr }}</p>
        </div>
        <div class="sirocco-badge"
             [class.badge-high]="siroccoRisk.risk_level === 'élevé'"
             [class.badge-low]="siroccoRisk.risk_level === 'faible'">
          {{ siroccoRisk.risk_level | titlecase }}
        </div>
      </div>
    </div>

    <!-- Alertes météo -->
    <div class="alerts-section" *ngIf="weatherAlerts.length > 0">
      <h3> Alertes actives</h3>
      <div class="alert-item"
           *ngFor="let alert of weatherAlerts"
           [class]="'alert-' + alert.severity">
        <span class="alert-msg">{{ alert.message_fr }}</span>
        <span class="alert-msg-ar">{{ alert.message_ar }}</span>
      </div>
    </div>

    <!-- Prévisions 7 jours -->
    <div class="forecast-section">
      <h3> Prévisions 7 jours / توقعات 7 أيام</h3>
      <div class="forecast-row">
        <div class="forecast-day" *ngFor="let day of forecast">
          <span class="fc-date">
            {{ day.date | date:'EEE dd/MM' }}
          </span>
          <span class="fc-icon">
            {{ getWeatherIcon(day.weather_code) }}
          </span>
          <span class="fc-max">{{ day.temp_max }}°</span>
          <span class="fc-min">{{ day.temp_min }}°</span>
          <span class="fc-rain" *ngIf="day.precipitation_mm > 0">
             {{ day.precipitation_mm }}mm
          </span>
        </div>
      </div>
    </div>

  </ng-container>
</div>`,
    css: `.page-container { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 700; color: #1a1a1a; }
.page-sub { font-size: 14px; color: #6b7280; margin-top: 4px; }

.loading-state {
  display: flex; flex-direction: column;
  align-items: center; min-height: 300px;
  justify-content: center; gap: 12px; color: #6b7280;
}
.spin { font-size: 48px; animation: spin 2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.weather-hero {
  background: linear-gradient(135deg, #1a5c2e, #2d8a4e);
  border-radius: 20px; padding: 32px;
  color: white; margin-bottom: 20px;
}
.weather-temp-big {
  font-size: 72px; font-weight: 800;
  line-height: 1; margin-bottom: 8px;
}
.weather-desc-big { font-size: 20px; opacity: 0.9; margin-bottom: 24px; }
.weather-desc-ar { opacity: 0.7; font-size: 16px; }

.weather-details-row {
  display: flex; gap: 0;
  background: rgba(255,255,255,0.15);
  border-radius: 12px; overflow: hidden;
}
.wd-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; padding: 14px 8px; gap: 4px;
  border-right: 1px solid rgba(255,255,255,0.15);
}
.wd-item:last-child { border-right: none; }
.wd-icon { font-size: 22px; }
.wd-val  { font-size: 18px; font-weight: 700; }
.wd-lbl  { font-size: 10px; opacity: 0.75; text-align: center; }

.sirocco-card {
  border-radius: 14px; padding: 16px 20px;
  margin-bottom: 16px; border: 1px solid;
}
.risk-high { background: #fef2f2; border-color: #fecaca; }
.risk-low  { background: #f0fdf4; border-color: #bbf7d0; }

.sirocco-header {
  display: flex; align-items: center; gap: 12px;
}
.sirocco-icon { font-size: 32px; }
.sirocco-header h3 {
  font-size: 15px; font-weight: 700; color: #1a1a1a;
  margin-bottom: 4px;
}
.sirocco-header p { font-size: 13px; color: #6b7280; flex: 1; }
.sirocco-badge {
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 700;
}
.badge-high { background: #fecaca; color: #dc2626; }
.badge-low  { background: #bbf7d0; color: #059669; }

.alerts-section { margin-bottom: 20px; }
.alerts-section h3 {
  font-size: 15px; font-weight: 700;
  margin-bottom: 12px; color: #1a1a1a;
}
.alert-item {
  display: flex; justify-content: space-between;
  align-items: center; padding: 12px 16px;
  border-radius: 10px; margin-bottom: 8px;
  font-size: 13px;
}
.alert-high   { background: #fef2f2; color: #dc2626; }
.alert-medium { background: #fffbeb; color: #d97706; }
.alert-low    { background: #f0fdf4; color: #059669; }
.alert-msg-ar { opacity: 0.7; font-size: 12px; }

.forecast-section { background: white; border-radius: 14px; padding: 20px; }
.forecast-section h3 {
  font-size: 15px; font-weight: 700;
  margin-bottom: 16px; color: #1a1a1a;
}
.forecast-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.forecast-day {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 12px 10px; min-width: 80px;
  background: #f8faf8; border-radius: 10px;
  border: 1px solid #e5e7eb; flex-shrink: 0;
}
.fc-date { font-size: 10px; color: #6b7280; text-align: center; }
.fc-icon { font-size: 24px; }
.fc-max  { font-size: 15px; font-weight: 700; color: #ef4444; }
.fc-min  { font-size: 13px; color: #3b82f6; }
.fc-rain { font-size: 10px; color: #0369a1; }`
  },
  'drought': {
    ts: `import { Component, OnInit } from '@angular/core';
import { AIService } from '../../../services/ai.service';

@Component({
  selector: 'app-drought',
  templateUrl: './drought.component.html',
  styleUrls: ['./drought.component.css']
})
export class DroughtComponent implements OnInit {
  city = localStorage.getItem('zahra_governorate') || 'Tunis';
  drought: any = null;
  isLoading = true;

  constructor(private aiService: AIService) {}

  ngOnInit() {
    this.aiService.getCurrentDrought(this.city).subscribe({
      next: (d) => { this.drought = d; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getSpiColor(level: string): string {
    const map: Record<string,string> = {
      'normal': '#10b981', 'modéré': '#f59e0b',
      'sévère': '#ef4444', 'extrême': '#7f1d1d'
    };
    return map[level] || '#6b7280';
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Sécheresse / الجفاف</h1>
    <p class="page-sub">Prévision SPI — {{ city }}</p>
  </div>

  <div class="loading-state" *ngIf="isLoading">
    <div class="spin"></div><p>Analyse en cours...</p>
  </div>

  <ng-container *ngIf="!isLoading && drought">

    <!-- Indicateur principal -->
    <div class="drought-hero"
         [style.background]="'linear-gradient(135deg, ' + getSpiColor(drought.drought_level) + '33, ' + getSpiColor(drought.drought_level) + '11'">
      <div class="drought-main">
        <div class="spi-circle"
             [style.borderColor]="getSpiColor(drought.drought_level)">
          <span class="spi-value"
                [style.color]="getSpiColor(drought.drought_level)">
            {{ drought.spi_index }}
          </span>
          <span class="spi-label">SPI</span>
        </div>
        <div class="drought-info">
          <h2 [style.color]="getSpiColor(drought.drought_level)">
            {{ drought.drought_level | titlecase }}
          </h2>
          <p>{{ drought.message_fr }}</p>
          <p class="msg-ar">{{ drought.message_ar }}</p>
          <div class="probability-bar">
            <div class="prob-fill"
                 [style.width.%]="drought.probability * 100"
                 [style.background]="getSpiColor(drought.drought_level)">
            </div>
          </div>
          <span class="prob-text">
            Probabilité : {{ (drought.probability * 100) | number:'1.0-0' }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Échelle SPI -->
    <div class="spi-scale-card">
      <h3> Échelle SPI / مقياس SPI</h3>
      <div class="spi-scale">
        <div class="scale-item" style="background:#dcfce7;color:#059669">
          ≥ 0 — Normal / طبيعي
        </div>
        <div class="scale-item" style="background:#fef9c3;color:#ca8a04">
          -1 à 0 — Légèrement sec / جاف قليلاً
        </div>
        <div class="scale-item" style="background:#fed7aa;color:#ea580c">
          -2 à -1 — Modérément sec / جفاف معتدل 
        </div>
        <div class="scale-item" style="background:#fecaca;color:#dc2626">
          ≤ -2 — Sécheresse sévère / جفاف شديد 
        </div>
      </div>
    </div>

    <!-- Conseil agricole -->
    <div class="advice-card">
      <h3> Conseil pour votre exploitation / نصيحة زراعية</h3>
      <div class="advice-content">
        <p *ngIf="drought.drought_level === 'normal'">
           Conditions normales. Maintenez votre calendrier d'irrigation habituel.
          / الظروف عادية. حافظ على جدول الري المعتاد.
        </p>
        <p *ngIf="drought.drought_level === 'modéré'">
           Stress hydrique modéré prévu. Augmentez la fréquence d'irrigation 
          et paillez vos cultures. / ضغط مائي معتدل متوقع. زد تكرار الري وقش محاصيلك.
        </p>
        <p *ngIf="drought.drought_level === 'sévère' || drought.drought_level === 'extrême'">
           Sécheresse sévère. Contactez le CRDA immédiatement et activez 
          l'irrigation d'urgence. / جفاف شديد. اتصل بـ CRDA فوراً وفعّل الري الطارئ.
        </p>
      </div>
    </div>

  </ng-container>
</div>`,
    css: `.page-container { max-width: 700px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 700; color: #1a1a1a; }
.page-sub { font-size: 14px; color: #6b7280; }
.loading-state { display:flex;flex-direction:column;align-items:center;min-height:300px;justify-content:center;gap:12px;color:#6b7280; }
.spin { font-size:48px;animation:spin 2s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.drought-hero {
  border-radius: 20px; padding: 28px;
  margin-bottom: 20px; border: 1px solid #e5e7eb;
}
.drought-main { display: flex; align-items: center; gap: 24px; }
.spi-circle {
  width: 110px; height: 110px; border-radius: 50%;
  border: 4px solid; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: white; flex-shrink: 0;
}
.spi-value { font-size: 28px; font-weight: 800; }
.spi-label { font-size: 11px; color: #6b7280; }
.drought-info { flex: 1; }
.drought-info h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.drought-info p  { font-size: 14px; color: #374151; margin-bottom: 4px; }
.msg-ar { font-size: 13px; color: #6b7280; }
.probability-bar {
  height: 6px; background: #e5e7eb;
  border-radius: 3px; margin: 10px 0 4px; overflow: hidden;
}
.prob-fill { height: 100%; border-radius: 3px; transition: width 0.8s; }
.prob-text { font-size: 12px; color: #6b7280; }

.spi-scale-card, .advice-card {
  background: white; border-radius: 14px;
  padding: 20px; margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.spi-scale-card h3, .advice-card h3 {
  font-size: 15px; font-weight: 700;
  color: #1a1a1a; margin-bottom: 14px;
}
.spi-scale { display: flex; flex-direction: column; gap: 8px; }
.scale-item {
  padding: 10px 14px; border-radius: 8px;
  font-size: 13px; font-weight: 500;
}
.advice-content p { font-size: 14px; color: #374151; line-height: 1.6; }`
  },
  'irrigation': {
    ts: `import { Component, OnInit } from '@angular/core';
import { AIService } from '../../../services/ai.service';
import { ParcelsService } from '../../../services/parcels.service';

@Component({
  selector: 'app-irrigation',
  templateUrl: './irrigation.component.html',
  styleUrls: ['./irrigation.component.css']
})
export class IrrigationComponent implements OnInit {
  parcels: any[] = [];
  selectedParcelId: number | null = null;
  weeklyPlan: any = null;
  isLoading = false;

  form = {
    crop: '', soil_type: 'Argilo-calcaire',
    temperature: 25, humidity: 55,
    rainfall_last_7d: 5, growth_stage: 'floraison'
  };
  irrigResult: any = null;
  calcLoading = false;

  readonly growthStages = [
    'semis', 'levée', 'tallage', 'floraison', 'grain', 'maturité'
  ];

  constructor(private aiService: AIService, private parcelsService: ParcelsService) {}

  ngOnInit() {
    this.parcelsService.getParcels().subscribe({
      next: (p) => {
        this.parcels = p || [];
        if (this.parcels.length > 0) {
          this.selectParcel(this.parcels[0].id);
        }
      }
    });
  }

  selectParcel(id: number) {
    this.selectedParcelId = id;
    this.isLoading = true;
    const parcel = this.parcels.find(p => p.id === id);
    if (parcel) this.form.crop = parcel.crop;
    this.aiService.getWeeklyIrrigationPlan(id).subscribe({
      next: (plan) => { this.weeklyPlan = plan; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  calculate() {
    this.calcLoading = true;
    this.aiService.predictIrrigation({
      ...this.form,
      temperature: +this.form.temperature,
      humidity: +this.form.humidity,
      rainfall_last_7d: +this.form.rainfall_last_7d,
    }).subscribe({
      next: (r) => { this.irrigResult = r; this.calcLoading = false; },
      error: () => { this.calcLoading = false; }
    });
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Irrigation / الري</h1>
    <p class="page-sub">Plan d'irrigation optimisé par l'IA (M5)</p>
  </div>

  <div class="parcel-selector" *ngIf="parcels.length > 0">
    <button class="parcel-tab"
            *ngFor="let p of parcels"
            [class.active]="selectedParcelId === p.id"
            (click)="selectParcel(p.id)">
       {{ p.name }}
    </button>
  </div>

  <div class="plan-card" *ngIf="weeklyPlan && !isLoading">
    <div class="plan-header">
      <h3> Plan de la semaine — {{ weeklyPlan.parcel_name }}</h3>
      <div class="plan-total">
         {{ weeklyPlan.total_water_mm }} mm total
      </div>
    </div>
    <div class="days-grid">
      <div class="day-item"
           *ngFor="let day of weeklyPlan.days || []"
           [class.irrigate]="day.irrigate"
           [class.no-irrigate]="!day.irrigate">
        <span class="day-name">{{ day.day }}</span>
        <span class="day-icon">{{ day.irrigate ? '' : '—' }}</span>
        <span class="day-amount" *ngIf="day.irrigate">
          {{ day.water_mm }} mm
        </span>
        <span class="day-method" *ngIf="day.irrigate">
          {{ day.method }}
        </span>
      </div>
    </div>
  </div>

  <div class="calc-card">
    <h3> Calcul personnalisé / حساب مخصص</h3>
    <div class="calc-grid">
      <div class="form-group">
        <label>Culture / المحصول</label>
        <select [(ngModel)]="form.crop" name="crop">
          <option value="Olivier"> Olivier</option>
          <option value="Tomate"> Tomate</option>
          <option value="Blé dur"> Blé dur</option>
          <option value="Piment"> Piment</option>
          <option value="Agrumes"> Agrumes</option>
        </select>
      </div>
      <div class="form-group">
        <label>Stade / الطور</label>
        <select [(ngModel)]="form.growth_stage" name="stage">
          <option *ngFor="let s of growthStages" [value]="s">{{ s }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Température °C / درجة الحرارة</label>
        <input type="number" [(ngModel)]="form.temperature" name="temp"/>
      </div>
      <div class="form-group">
        <label>Humidité % / رطوبة</label>
        <input type="number" [(ngModel)]="form.humidity" name="hum"/>
      </div>
      <div class="form-group">
        <label>Pluie 7j mm / أمطار</label>
        <input type="number" [(ngModel)]="form.rainfall_last_7d" name="rain"/>
      </div>
    </div>
    <button class="btn-calc" (click)="calculate()" [disabled]="calcLoading">
      {{ calcLoading ? ' Calcul...' : ' Calculer' }}
    </button>

    <div class="irrig-result" *ngIf="irrigResult">
      <div class="result-highlight">
        <span class="result-icon"></span>
        <div>
          <h3>{{ irrigResult.water_amount_mm }} mm</h3>
          <p>dose recommandée / الجرعة الموصى بها</p>
        </div>
      </div>
      <div class="result-details">
        <div class="rd-item">
          <span> Méthode</span>
          <strong>{{ irrigResult.method }}</strong>
        </div>
        <div class="rd-item">
          <span> Urgence</span>
          <strong>{{ irrigResult.urgency }}</strong>
        </div>
      </div>
      <p class="result-msg">{{ irrigResult.message_fr }}</p>
      <p class="result-msg-ar">{{ irrigResult.message_ar }}</p>
    </div>
  </div>
</div>`,
    css: `.page-container { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 700; color: #1a1a1a; }
.page-sub { font-size: 14px; color: #6b7280; }

.parcel-selector { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px; }
.parcel-tab {
  padding:8px 16px;border-radius:20px;border:1px solid #e5e7eb;
  background:white;cursor:pointer;font-size:13px;transition:all 0.2s;
}
.parcel-tab.active { background:#1a5c2e;color:white;border-color:#1a5c2e; }

.plan-card, .calc-card {
  background:white;border-radius:14px;padding:20px;
  margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);
}
.plan-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:16px; }
.plan-header h3 { font-size:15px;font-weight:700;color:#1a1a1a; }
.plan-total { background:#eff6ff;color:#1d4ed8;padding:6px 12px;border-radius:20px;font-size:13px;font-weight:600; }

.days-grid { display:flex;gap:8px;overflow-x:auto;padding-bottom:4px; }
.day-item {
  display:flex;flex-direction:column;align-items:center;gap:4px;
  padding:12px 10px;min-width:90px;border-radius:10px;
  flex-shrink:0;text-align:center;
}
.day-item.irrigate    { background:#eff6ff;border:1px solid #bfdbfe; }
.day-item.no-irrigate { background:#f9fafb;border:1px solid #e5e7eb; }
.day-name   { font-size:11px;color:#6b7280;font-weight:600; }
.day-icon   { font-size:20px; }
.day-amount { font-size:14px;font-weight:700;color:#0369a1; }
.day-method { font-size:10px;color:#6b7280; }

.calc-card h3 { font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:16px; }
.calc-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:16px; }
.form-group { display:flex;flex-direction:column;gap:6px; }
.form-group label { font-size:12px;font-weight:600;color:#374151; }
.form-group input, .form-group select {
  padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;
  font-size:14px;outline:none;background:#fafafa;
}
.form-group input:focus, .form-group select:focus { border-color:#2d8a4e; }

.btn-calc {
  padding:11px 24px;background:#0369a1;color:white;
  border:none;border-radius:10px;font-size:14px;
  font-weight:600;cursor:pointer;transition:opacity 0.2s;
}
.btn-calc:disabled { opacity:0.6;cursor:not-allowed; }

.irrig-result { margin-top:16px;padding:16px;background:#f0f9ff;border-radius:12px; }
.result-highlight { display:flex;align-items:center;gap:12px;margin-bottom:12px; }
.result-icon { font-size:36px; }
.result-highlight h3 { font-size:28px;font-weight:800;color:#0369a1; }
.result-highlight p  { font-size:13px;color:#6b7280; }
.result-details { display:flex;gap:16px;margin-bottom:10px; }
.rd-item { display:flex;flex-direction:column;gap:2px; }
.rd-item span    { font-size:12px;color:#6b7280; }
.rd-item strong  { font-size:14px;font-weight:700;color:#1a1a1a; }
.result-msg    { font-size:13px;color:#0369a1;line-height:1.5; }
.result-msg-ar { font-size:12px;color:#6b7280; }`
  }
};

const basePath = path.join(__dirname, 'src/app/features');

for (const feature of Object.keys(components)) {
  const comp = components[feature];
  const dir = path.join(basePath, feature);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, `${feature}.component.ts`), cleanEmojis(comp.ts));
  fs.writeFileSync(path.join(dir, `${feature}.component.html`), cleanEmojis(comp.html));
  fs.writeFileSync(path.join(dir, `${feature}.component.css`), cleanEmojis(comp.css));
}
console.log("3 components generated");
