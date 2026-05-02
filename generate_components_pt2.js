const fs = require('fs');
const path = require('path');

const cleanEmojis = (str) => {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2139}\u{2192}\u{2193}\u{2191}\u{2714}\u{274C}\u{FE0F}\u{200D}\u{2B55}\u{2705}\u{1F9A0}-\u{1F9FF}]/gu, '');
};

const components = {
  'pest': {
    ts: `import { Component, OnInit } from '@angular/core';
import { ParcelsService } from '../../../services/parcels.service';
import { AIService } from '../../../services/ai.service';

@Component({
  selector: 'app-pest',
  templateUrl: './pest.component.html',
  styleUrls: ['./pest.component.css']
})
export class PestComponent implements OnInit {
  parcels: any[] = [];
  selectedParcel: any = null;
  pestRisk: any = null;
  isLoading = false;
  form = { crop:'', region:'', temperature:25, humidity:55, month: new Date().getMonth()+1, rainfall_last_30d:20 };
  pestResult: any = null;
  calcLoading = false;

  constructor(private parcelsService: ParcelsService, private aiService: AIService) {}

  ngOnInit() {
    this.parcelsService.getParcels().subscribe({
      next: (p) => {
        this.parcels = p || [];
        if (this.parcels.length > 0) this.selectParcel(this.parcels[0]);
      }
    });
  }

  selectParcel(p: any) {
    this.selectedParcel = p;
    this.form.crop   = p.crop;
    this.form.region = p.region;
    this.isLoading = true;
    this.aiService.getPestRisk(p.id).subscribe({
      next: (r) => { this.pestRisk = r; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  analyze() {
    this.calcLoading = true;
    this.aiService.predictPestRisk({
      ...this.form,
      temperature: +this.form.temperature,
      humidity: +this.form.humidity,
      month: +this.form.month,
      rainfall_last_30d: +this.form.rainfall_last_30d,
    }).subscribe({
      next: (r) => { this.pestResult = r; this.calcLoading = false; },
      error: () => { this.calcLoading = false; }
    });
  }

  getRiskColor(level: string): string {
    const map: Record<string,string> = {
      'faible ': '#10b981', 'modéré ': '#f59e0b', 'élevé ': '#ef4444'
    };
    for (const k of Object.keys(map)) {
      if (level?.toLowerCase().includes(k.split(' ')[0])) return map[k];
    }
    return '#6b7280';
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Ravageurs / الآفات</h1>
    <p class="page-sub">Prédiction des risques — Modèle M7</p>
  </div>

  <div class="parcel-selector" *ngIf="parcels.length > 0">
    <button class="parcel-tab"
            *ngFor="let p of parcels"
            [class.active]="selectedParcel?.id === p.id"
            (click)="selectParcel(p)">
       {{ p.name }}
    </button>
  </div>

  <div class="risk-card" *ngIf="pestRisk && !isLoading">
    <div class="risk-header">
      <div class="risk-level-badge"
           [style.background]="getRiskColor(pestRisk.risk_level) + '20'"
           [style.color]="getRiskColor(pestRisk.risk_level)"
           [style.borderColor]="getRiskColor(pestRisk.risk_level)">
        {{ pestRisk.risk_level }}
      </div>
      <div class="risk-score">
        Score : {{ (pestRisk.risk_score * 100) | number:'1.0-0' }}%
      </div>
    </div>

    <div class="pests-list">
      <h4> Ravageurs probables / الآفات المحتملة</h4>
      <div class="pest-tag"
           *ngFor="let pest of pestRisk.likely_pests || []">
        {{ pest }}
      </div>
    </div>

    <div class="prevention-box">
      <h4> Prévention</h4>
      <p>{{ pestRisk.prevention_fr }}</p>
      <p class="prev-ar">{{ pestRisk.prevention_ar }}</p>
    </div>
  </div>

  <div class="top3-card" *ngIf="pestResult?.top3_risks">
    <h3> Analyse détaillée</h3>
    <div class="top3-item"
         *ngFor="let item of pestResult.top3_risks">
      <span class="top3-name">{{ item.pest }}</span>
      <div class="top3-bar">
        <div class="top3-fill"
             [style.width.%]="item.probability">
        </div>
      </div>
      <span class="top3-pct">{{ item.probability }}%</span>
    </div>
  </div>

  <div class="calc-card">
    <h3> Analyse personnalisée / تحليل مخصص</h3>
    <div class="calc-grid">
      <div class="form-group">
        <label>Culture</label>
        <select [(ngModel)]="form.crop" name="crop">
          <option value="Olivier"> Olivier</option>
          <option value="Tomate"> Tomate</option>
          <option value="Blé dur"> Blé dur</option>
          <option value="Piment"> Piment</option>
        </select>
      </div>
      <div class="form-group">
        <label>Mois / الشهر</label>
        <input type="number" [(ngModel)]="form.month"
               name="month" min="1" max="12"/>
      </div>
      <div class="form-group">
        <label>Température °C</label>
        <input type="number" [(ngModel)]="form.temperature" name="temp"/>
      </div>
      <div class="form-group">
        <label>Humidité %</label>
        <input type="number" [(ngModel)]="form.humidity" name="hum"/>
      </div>
      <div class="form-group">
        <label>Pluie 30j mm</label>
        <input type="number" [(ngModel)]="form.rainfall_last_30d" name="rain"/>
      </div>
    </div>
    <button class="btn-calc" (click)="analyze()" [disabled]="calcLoading">
      {{ calcLoading ? ' Analyse...' : ' Analyser' }}
    </button>

    <div class="pest-result" *ngIf="pestResult">
      <div class="pest-result-header"
           [style.color]="getRiskColor(pestResult.risk_level)">
        <strong>{{ pestResult.risk_level }}</strong>
        — {{ pestResult.pest_detected }}
        ({{ pestResult.probability }}%)
      </div>
      <p>{{ pestResult.treatment }}</p>
      <p class="window-info"> {{ pestResult.treatment_window }}</p>
      <div class="crda-alert" *ngIf="pestResult.notify_crda">
         Signalement CRDA obligatoire / إبلاغ CRDA إلزامي
      </div>
    </div>
  </div>
</div>`,
    css: `.page-container{max-width:900px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.parcel-selector{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
.parcel-tab{padding:8px 16px;border-radius:20px;border:1px solid #e5e7eb;background:white;cursor:pointer;font-size:13px;transition:all 0.2s;}
.parcel-tab.active{background:#1a5c2e;color:white;border-color:#1a5c2e;}
.risk-card,.top3-card,.calc-card{background:white;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.risk-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.risk-level-badge{padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px;border:1px solid;}
.risk-score{font-size:14px;color:#6b7280;}
.pests-list h4{font-size:13px;font-weight:600;color:#374151;margin-bottom:10px;}
.pests-list{margin-bottom:16px;}
.pest-tag{display:inline-block;background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:13px;margin:4px 4px 4px 0;}
.prevention-box{background:#f0fdf4;border-radius:10px;padding:14px;}
.prevention-box h4{font-size:13px;font-weight:600;color:#166534;margin-bottom:6px;}
.prevention-box p{font-size:13px;color:#166534;line-height:1.5;}
.prev-ar{color:#6b7280!important;font-size:12px!important;}
.top3-card h3{font-size:15px;font-weight:700;margin-bottom:14px;}
.top3-item{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.top3-name{font-size:13px;color:#374151;min-width:160px;}
.top3-bar{flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;}
.top3-fill{height:100%;background:#f59e0b;border-radius:4px;transition:width 0.5s;}
.top3-pct{font-size:12px;color:#6b7280;min-width:40px;text-align:right;}
.calc-card h3{font-size:15px;font-weight:700;margin-bottom:16px;}
.calc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:16px;}
.form-group{display:flex;flex-direction:column;gap:6px;}
.form-group label{font-size:12px;font-weight:600;color:#374151;}
.form-group input,.form-group select{padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;}
.btn-calc{padding:11px 24px;background:#92400e;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;}
.btn-calc:disabled{opacity:0.6;cursor:not-allowed;}
.pest-result{margin-top:16px;padding:14px;background:#fffbeb;border-radius:10px;}
.pest-result-header{font-size:15px;margin-bottom:8px;}
.pest-result p{font-size:13px;color:#78350f;line-height:1.5;}
.window-info{color:#0369a1!important;}
.crda-alert{margin-top:10px;padding:10px 14px;background:#fef2f2;border-radius:8px;color:#dc2626;font-size:13px;font-weight:600;}`
  },
  'ndvi': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParcelsService } from '../../../services/parcels.service';
import { AIService } from '../../../services/ai.service';
// Assuming NdviService is created, mock import below if not
// import { NdviService } from '../../../services/ndvi.service';

@Component({
  selector: 'app-ndvi',
  templateUrl: './ndvi.component.html',
  styleUrls: ['./ndvi.component.css']
})
export class NdviComponent implements OnInit {
  parcels: any[] = [];
  selectedParcel: any = null;
  ndviData: any = null;
  ndviHistory: any[] = [];
  ndviCompare: any = null;
  anomaly: any = null;
  isLoading = false;

  // Mocking NdviService here since it might not be in services list
  ndviService = {
    getNDVI: (id: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    getNDVIHistory: (id: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    getNDVICompare: (id: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor(private parcelsService: ParcelsService, private aiService: AIService) {}

  ngOnInit() {
    this.parcelsService.getParcels().subscribe({
      next: (p) => {
        this.parcels = p || [];
        if (this.parcels.length > 0) this.selectParcel(this.parcels[0]);
      }
    });
  }

  selectParcel(p: any) {
    this.selectedParcel = p;
    this.isLoading = true;
    forkJoin({
      ndvi:    this.ndviService.getNDVI(p.id) as any,
      history: this.ndviService.getNDVIHistory(p.id) as any,
      compare: this.ndviService.getNDVICompare(p.id) as any,
      anomaly: this.aiService.getNDVIAnomaly(p.id) as any,
    }).subscribe({
      next: (r: any) => {
        this.ndviData    = r.ndvi;
        this.ndviHistory = r.history?.history || [];
        this.ndviCompare = r.compare;
        this.anomaly     = r.anomaly;
        this.isLoading   = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getNdviColor(val: number): string {
    if (val > 0.6) return '#10b981';
    if (val > 0.4) return '#f59e0b';
    if (val > 0.2) return '#ef4444';
    return '#7f1d1d';
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> NDVI & Anomalies</h1>
    <p class="page-sub">Surveillance végétale par satellite</p>
  </div>

  <div class="parcel-selector" *ngIf="parcels.length > 0">
    <button class="parcel-tab"
            *ngFor="let p of parcels"
            [class.active]="selectedParcel?.id === p.id"
            (click)="selectParcel(p)">
       {{ p.name }}
    </button>
  </div>

  <ng-container *ngIf="!isLoading && ndviData">

    <div class="anomaly-banner"
         *ngIf="anomaly?.is_anomaly">
      <span class="anomaly-icon"></span>
      <div>
        <h3>Anomalie NDVI détectée / شذوذ NDVI</h3>
        <p>{{ anomaly.message_fr }}</p>
        <p class="msg-ar">{{ anomaly.message_ar }}</p>
      </div>
      <div class="anomaly-score">
        Score : {{ anomaly.anomaly_score }}
      </div>
    </div>

    <div class="ndvi-hero">
      <div class="ndvi-gauge-wrapper">
        <div class="ndvi-gauge"
             [style.background]="getNdviColor(ndviData.ndvi) + '20'"
             [style.borderColor]="getNdviColor(ndviData.ndvi)">
          <span class="ndvi-val"
                [style.color]="getNdviColor(ndviData.ndvi)">
            {{ ndviData.ndvi | number:'1.2-2' }}
          </span>
          <span class="ndvi-lbl">NDVI</span>
        </div>
      </div>
      <div class="ndvi-info">
        <h2>{{ ndviData.classification_fr }}</h2>
        <p class="ndvi-ar">{{ ndviData.classification_ar }}</p>
        <div class="compare-row" *ngIf="ndviCompare">
          <span class="cmp-item">
             {{ ndviCompare.current_year?.year }} :
            <strong>{{ ndviCompare.current_year?.ndvi }}</strong>
          </span>
          <span class="cmp-arrow"
                [class.up]="ndviCompare.trend === 'amélioration'"
                [class.down]="ndviCompare.trend === 'dégradation'">
            {{ ndviCompare.trend === 'amélioration' ? '' : '' }}
          </span>
          <span class="cmp-item">
             {{ ndviCompare.previous_year?.year }} :
            <strong>{{ ndviCompare.previous_year?.ndvi }}</strong>
          </span>
        </div>
        <div class="trend-badge"
             *ngIf="ndviCompare"
             [class.trend-up]="ndviCompare.trend === 'amélioration'"
             [class.trend-down]="ndviCompare.trend === 'dégradation'">
          {{ ndviCompare.trend }} {{ ndviCompare.difference > 0 ? '+' : '' }}{{ ndviCompare.difference }}
        </div>
      </div>
    </div>

    <div class="history-card" *ngIf="ndviHistory.length > 0">
      <h3> Historique NDVI / تاريخ NDVI</h3>
      <div class="history-bars">
        <div class="hist-bar-item"
             *ngFor="let h of ndviHistory">
          <div class="hist-bar-wrap">
            <div class="hist-bar"
                 [style.height.%]="h.ndvi * 100"
                 [style.background]="getNdviColor(h.ndvi)">
            </div>
          </div>
          <span class="hist-week">{{ h.week }}</span>
          <span class="hist-val">{{ h.ndvi }}</span>
        </div>
      </div>
    </div>

  </ng-container>
</div>`,
    css: `.page-container{max-width:900px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.parcel-selector{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
.parcel-tab{padding:8px 16px;border-radius:20px;border:1px solid #e5e7eb;background:white;cursor:pointer;font-size:13px;transition:all 0.2s;}
.parcel-tab.active{background:#1a5c2e;color:white;border-color:#1a5c2e;}
.anomaly-banner{display:flex;align-items:center;gap:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 20px;margin-bottom:20px;}
.anomaly-icon{font-size:32px;}
.anomaly-banner h3{font-size:15px;font-weight:700;color:#92400e;margin-bottom:4px;}
.anomaly-banner p{font-size:13px;color:#78350f;}
.msg-ar{color:#6b7280!important;font-size:12px!important;}
.anomaly-score{background:#fef3c7;color:#92400e;padding:6px 12px;border-radius:10px;font-size:13px;font-weight:700;white-space:nowrap;}
.ndvi-hero{background:white;border-radius:14px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;align-items:center;gap:24px;}
.ndvi-gauge{width:120px;height:120px;border-radius:50%;border:4px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;}
.ndvi-val{font-size:26px;font-weight:800;}
.ndvi-lbl{font-size:12px;color:#6b7280;}
.ndvi-info{flex:1;}
.ndvi-info h2{font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
.ndvi-ar{font-size:14px;color:#6b7280;margin-bottom:12px;}
.compare-row{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
.cmp-item{font-size:13px;color:#374151;}
.cmp-arrow{font-size:20px;font-weight:700;}
.cmp-arrow.up{color:#10b981;}
.cmp-arrow.down{color:#ef4444;}
.trend-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;}
.trend-up{background:#dcfce7;color:#059669;}
.trend-down{background:#fef2f2;color:#dc2626;}
.history-card{background:white;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.history-card h3{font-size:15px;font-weight:700;margin-bottom:16px;}
.history-bars{display:flex;gap:8px;align-items:flex-end;overflow-x:auto;padding-bottom:4px;}
.hist-bar-item{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:60px;}
.hist-bar-wrap{height:80px;display:flex;align-items:flex-end;}
.hist-bar{width:32px;border-radius:4px 4px 0 0;min-height:4px;transition:height 0.5s;}
.hist-week{font-size:9px;color:#9ca3af;}
.hist-val{font-size:11px;font-weight:600;color:#374151;}`
  },
  'market': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParcelsService } from '../../../services/parcels.service';
// import { MarketService } from '../../../services/market.service';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css']
})
export class MarketComponent implements OnInit {
  prices: any[] = [];
  buyers: any[] = [];
  parcels: any[] = [];
  selectedParcel: any = null;
  sellAdvice: any = null;
  revenueForecast: any = null;
  isLoading = true;
  activeTab = 'prices';

  marketService = {
    getPrices: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getBuyers: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getSellAdvice: (id: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    getRevenueForecast: (id: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor(private parcelsService: ParcelsService) {}

  ngOnInit() {
    forkJoin({
      prices:  this.marketService.getPrices() as any,
      buyers:  this.marketService.getBuyers() as any,
      parcels: this.parcelsService.getParcels() as any,
    }).subscribe({
      next: (r: any) => {
        const pricesObj = r.prices?.prices || {};
        this.prices  = Object.entries(pricesObj).map(
          ([crop, data]: [string, any]) => ({ crop, ...data })
        );
        this.buyers  = r.buyers?.buyers || [];
        this.parcels = r.parcels || [];
        if (this.parcels.length > 0) {
          this.loadParcelAdvice(this.parcels[0]);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadParcelAdvice(p: any) {
    this.selectedParcel = p;
    forkJoin({
      advice:  this.marketService.getSellAdvice(p.id) as any,
      revenue: this.marketService.getRevenueForecast(p.id) as any,
    }).subscribe({
      next: (r: any) => {
        this.sellAdvice      = r.advice;
        this.revenueForecast = r.revenue;
      }
    });
  }

  getTrendIcon(trend: string): string {
    if (trend === 'hausse') return '';
    if (trend === 'baisse') return '';
    return '';
  }

  getTrendClass(trend: string): string {
    if (trend === 'hausse') return 'trend-up';
    if (trend === 'baisse') return 'trend-down';
    return 'trend-stable';
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Marché / السوق</h1>
    <p class="page-sub">Prix en temps réel + conseils de vente</p>
  </div>

  <div class="loading-state" *ngIf="isLoading">
    <div class="spin"></div><p>Chargement...</p>
  </div>

  <ng-container *ngIf="!isLoading">

    <div class="tab-bar">
      <button class="tab-btn" [class.active]="activeTab==='prices'"   (click)="activeTab='prices'"> Prix</button>
      <button class="tab-btn" [class.active]="activeTab==='advice'"   (click)="activeTab='advice'"> Conseils</button>
      <button class="tab-btn" [class.active]="activeTab==='buyers'"   (click)="activeTab='buyers'"> Acheteurs</button>
    </div>

    <div *ngIf="activeTab === 'prices'">
      <div class="prices-table">
        <div class="price-row"
             *ngFor="let item of prices">
          <div class="price-crop">
            <span class="price-market">{{ item.market }}</span>
            <strong>{{ item.crop }}</strong>
          </div>
          <div class="price-right">
            <span class="price-val">{{ item.price }} {{ item.unit }}</span>
            <span class="price-trend" [class]="getTrendClass(item.trend)">
              {{ getTrendIcon(item.trend) }} {{ item.trend }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="activeTab === 'advice'">
      <div class="parcel-selector" *ngIf="parcels.length > 0">
        <button class="parcel-tab"
                *ngFor="let p of parcels"
                [class.active]="selectedParcel?.id === p.id"
                (click)="loadParcelAdvice(p)">
           {{ p.name }}
        </button>
      </div>

      <div class="advice-card" *ngIf="sellAdvice">
        <div class="advice-header">
          <span class="advice-icon"></span>
          <div>
            <h3>Conseil de vente / نصيحة البيع</h3>
            <p>{{ sellAdvice.advice_fr }}</p>
            <p class="advice-ar">{{ sellAdvice.advice_ar }}</p>
          </div>
          <div class="price-now">
            <span class="pn-label">Prix actuel</span>
            <span class="pn-val">{{ sellAdvice.current_price }} DT/kg</span>
            <span class="pn-trend" [class]="getTrendClass(sellAdvice.trend)">
              {{ getTrendIcon(sellAdvice.trend) }}
            </span>
          </div>
        </div>
      </div>

      <div class="revenue-card" *ngIf="revenueForecast">
        <h3> Revenu prévisionnel / الدخل المتوقع</h3>
        <div class="revenue-grid">
          <div class="rev-item">
            <span> Culture</span>
            <strong>{{ revenueForecast.crop }}</strong>
          </div>
          <div class="rev-item">
            <span> Surface</span>
            <strong>{{ revenueForecast.area_ha }} ha</strong>
          </div>
          <div class="rev-item">
            <span> Rendement estimé</span>
            <strong>{{ revenueForecast.estimated_yield_t_ha }} T/ha</strong>
          </div>
          <div class="rev-item highlight">
            <span> Revenu estimé</span>
            <strong>{{ revenueForecast.estimated_revenue_dt | number }} DT</strong>
          </div>
        </div>
        <p class="rev-msg">{{ revenueForecast.message_fr }}</p>
      </div>
    </div>

    <div *ngIf="activeTab === 'buyers'">
      <div class="buyers-list">
        <div class="buyer-card" *ngFor="let b of buyers">
          <div class="buyer-header">
            <span class="buyer-type-badge">{{ b.type }}</span>
            <h3>{{ b.name }}</h3>
          </div>
          <div class="buyer-details">
            <span> {{ b.crops?.join(', ') }}</span>
            <span> {{ b.region }}</span>
            <span> {{ b.phone }}</span>
          </div>
        </div>
      </div>
    </div>

  </ng-container>
</div>`,
    css: `.page-container{max-width:900px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.loading-state{display:flex;flex-direction:column;align-items:center;min-height:300px;justify-content:center;gap:12px;color:#6b7280;}
.spin{font-size:48px;animation:spin 2s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.tab-bar{display:flex;gap:4px;background:white;border-radius:12px;padding:6px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.tab-btn{padding:8px 16px;border:none;border-radius:8px;background:none;cursor:pointer;font-size:13px;color:#6b7280;transition:all 0.2s;}
.tab-btn.active{background:#1a5c2e;color:white;font-weight:600;}
.prices-table{background:white;border-radius:14px;padding:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.price-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:10px;transition:background 0.2s;}
.price-row:hover{background:#f8faf8;}
.price-crop{display:flex;flex-direction:column;}
.price-market{font-size:10px;color:#9ca3af;text-transform:uppercase;}
.price-crop strong{font-size:15px;color:#1a1a1a;}
.price-right{display:flex;align-items:center;gap:12px;}
.price-val{font-size:16px;font-weight:700;color:#1a5c2e;}
.price-trend{font-size:12px;padding:3px 10px;border-radius:20px;font-weight:600;}
.trend-up{color:#059669;background:#dcfce7;}
.trend-down{color:#dc2626;background:#fef2f2;}
.trend-stable{color:#6b7280;background:#f3f4f6;}
.parcel-selector{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.parcel-tab{padding:8px 16px;border-radius:20px;border:1px solid #e5e7eb;background:white;cursor:pointer;font-size:13px;transition:all 0.2s;}
.parcel-tab.active{background:#1a5c2e;color:white;border-color:#1a5c2e;}
.advice-card,.revenue-card{background:white;border-radius:14px;padding:20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.advice-header{display:flex;align-items:flex-start;gap:12px;}
.advice-icon{font-size:32px;}
.advice-header h3{font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
.advice-header p{font-size:14px;color:#374151;flex:1;}
.advice-ar{color:#6b7280!important;font-size:12px!important;}
.price-now{display:flex;flex-direction:column;align-items:center;background:#f0fdf4;border-radius:10px;padding:12px 16px;min-width:100px;}
.pn-label{font-size:10px;color:#6b7280;}
.pn-val{font-size:20px;font-weight:800;color:#1a5c2e;}
.pn-trend{font-size:20px;}
.revenue-card h3{font-size:15px;font-weight:700;margin-bottom:14px;}
.revenue-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;}
.rev-item{background:#f8faf8;border-radius:8px;padding:10px 14px;display:flex;flex-direction:column;gap:4px;}
.rev-item span{font-size:12px;color:#6b7280;}
.rev-item strong{font-size:15px;font-weight:700;color:#1a1a1a;}
.rev-item.highlight{background:#f0fdf4;border:1px solid #bbf7d0;}
.rev-item.highlight strong{color:#1a5c2e;font-size:18px;}
.rev-msg{font-size:13px;color:#6b7280;}
.buyers-list{display:flex;flex-direction:column;gap:12px;}
.buyer-card{background:white;border-radius:12px;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.buyer-header{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.buyer-type-badge{background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.buyer-header h3{font-size:15px;font-weight:700;color:#1a1a1a;}
.buyer-details{display:flex;flex-wrap:wrap;gap:12px;}
.buyer-details span{font-size:13px;color:#6b7280;}`
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
console.log("3 more components generated");
