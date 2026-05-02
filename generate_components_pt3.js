const fs = require('fs');
const path = require('path');

const cleanEmojis = (str) => {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2139}\u{2192}\u{2193}\u{2191}\u{2714}\u{274C}\u{FE0F}\u{200D}\u{2B55}\u{2705}\u{1F9A0}-\u{1F9FF}]/gu, '');
};

const components = {
  'alerts': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlertsService } from '../../../services/alerts.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  alerts: any[] = [];
  communityAlerts: any[] = [];
  isLoading = true;
  activeTab = 'mine';
  governorate = localStorage.getItem('zahra_governorate') || 'Tunis';

  constructor(private alertsService: AlertsService) {}

  ngOnInit() {
    forkJoin({
      alerts:    this.alertsService.getAlerts() as any,
      community: this.alertsService.getCommunityAlerts(this.governorate) as any,
    }).subscribe({
      next: (r: any) => {
        this.alerts          = r.alerts || [];
        this.communityAlerts = r.community || [];
        this.isLoading       = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  markRead(alert: any) {
    this.alertsService.markAsRead(alert.id).subscribe({
      next: () => { alert.is_read = true; }
    });
  }

  getAlertIcon(type: string): string {
    return '';
  }

  getSeverityClass(s: string): string {
    const map: Record<string,string> = {
      critical:'alert-critical', high:'alert-high',
      medium:'alert-medium', low:'alert-low'
    };
    return map[s] || 'alert-low';
  }

  get unreadCount(): number {
    return this.alerts.filter(a => !a.is_read).length;
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Alertes / التنبيهات</h1>
    <p class="page-sub">
      {{ alerts.length }} alertes — 
      {{ unreadCount }} non lues
    </p>
  </div>

  <div class="tab-bar">
    <button class="tab-btn" [class.active]="activeTab==='mine'"
            (click)="activeTab='mine'">
       Mes alertes
      <span class="tab-count" *ngIf="alerts.length">{{ alerts.length }}</span>
    </button>
    <button class="tab-btn" [class.active]="activeTab==='community'"
            (click)="activeTab='community'">
       Communauté
      <span class="tab-count" *ngIf="communityAlerts.length">
        {{ communityAlerts.length }}
      </span>
    </button>
  </div>

  <div class="loading-state" *ngIf="isLoading">
    <div class="spin"></div><p>Chargement...</p>
  </div>

  <div *ngIf="!isLoading && activeTab === 'mine'">
    <div class="empty-state" *ngIf="alerts.length === 0">
      <span></span>
      <p>Aucune alerte active / لا تنبيهات</p>
    </div>
    <div class="alert-card"
         *ngFor="let alert of alerts"
         [class]="getSeverityClass(alert.severity)"
         [class.read]="alert.is_read">
      <div class="alert-card-left">
        <span class="alert-type-icon">
          {{ getAlertIcon(alert.type) }}
        </span>
        <div class="alert-content">
          <p class="alert-msg-fr">{{ alert.message_fr }}</p>
          <p class="alert-msg-ar">{{ alert.message_ar }}</p>
          <span class="alert-date">
            {{ alert.created_at | date:'dd/MM/yyyy HH:mm' }}
          </span>
        </div>
      </div>
      <button class="btn-read"
              *ngIf="!alert.is_read"
              (click)="markRead(alert)">
        Lu
      </button>
    </div>
  </div>

  <div *ngIf="!isLoading && activeTab === 'community'">
    <div class="empty-state" *ngIf="communityAlerts.length === 0">
      <span></span>
      <p>Aucune alerte dans votre région</p>
    </div>
    <div class="alert-card community-alert"
         *ngFor="let alert of communityAlerts">
      <span class="alert-type-icon">
        {{ getAlertIcon(alert.type) }}
      </span>
      <div class="alert-content">
        <p class="alert-msg-fr">{{ alert.message_fr }}</p>
        <p class="alert-msg-ar">{{ alert.message_ar }}</p>
      </div>
    </div>
  </div>
</div>`,
    css: `.page-container{max-width:800px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.tab-bar{display:flex;gap:4px;background:white;border-radius:12px;padding:6px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.tab-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;background:none;cursor:pointer;font-size:13px;color:#6b7280;transition:all 0.2s;}
.tab-btn.active{background:#1a5c2e;color:white;font-weight:600;}
.tab-count{background:rgba(255,255,255,0.3);padding:1px 6px;border-radius:10px;font-size:11px;}
.loading-state{display:flex;flex-direction:column;align-items:center;min-height:200px;justify-content:center;gap:12px;color:#6b7280;}
.spin{font-size:48px;animation:spin 2s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.empty-state{display:flex;flex-direction:column;align-items:center;padding:48px;gap:8px;color:#6b7280;}
.empty-state span{font-size:40px;}
.alert-card{display:flex;align-items:flex-start;justify-content:space-between;padding:14px 16px;border-radius:12px;margin-bottom:8px;border-left:4px solid;transition:opacity 0.2s;}
.alert-card.read{opacity:0.6;}
.alert-card-left{display:flex;align-items:flex-start;gap:12px;flex:1;}
.alert-type-icon{font-size:24px;flex-shrink:0;}
.alert-content{flex:1;}
.alert-msg-fr{font-size:14px;color:#1a1a1a;margin-bottom:2px;}
.alert-msg-ar{font-size:12px;color:#6b7280;margin-bottom:4px;}
.alert-date{font-size:11px;color:#9ca3af;}
.btn-read{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;white-space:nowrap;transition:all 0.2s;color:#374151;}
.btn-read:hover{border-color:#2d8a4e;color:#2d8a4e;}
.alert-low     {background:#f0fdf4;border-color:#10b981;}
.alert-medium  {background:#fffbeb;border-color:#f59e0b;}
.alert-high    {background:#fff7ed;border-color:#ef4444;}
.alert-critical{background:#fef2f2;border-color:#dc2626;}
.community-alert{background:#eff6ff;border-color:#3b82f6;}`
  },
  'treatments': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParcelsService } from '../../../services/parcels.service';
// import { TreatmentsService } from '../../../services/treatments.service';

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.css']
})
export class TreatmentsComponent implements OnInit {
  darReminders: any[] = [];
  treatmentLog: any[] = [];
  pesticides: any[] = [];
  parcels: any[] = [];
  selectedParcelId: number | null = null;
  isLoading = true;
  activeTab = 'reminders';
  showForm = false;

  form = {
    parcel_id: 0, product: '',
    dose: '', date_applied: new Date().toISOString().split('T')[0],
    disease_treated: '', dar_days: 14
  };

  treatmentsService = {
    getDARReminders: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getTreatmentLog: (id: any) => ({ subscribe: (cb: any) => cb.next([]) }),
    getPesticides: () => ({ subscribe: (cb: any) => cb.next({}) }),
    logTreatment: (data: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor(private parcelsService: ParcelsService) {}

  ngOnInit() {
    forkJoin({
      reminders:  this.treatmentsService.getDARReminders() as any,
      pesticides: this.treatmentsService.getPesticides() as any,
      parcels:    this.parcelsService.getParcels() as any,
    }).subscribe({
      next: (r: any) => {
        this.darReminders = r.reminders || [];
        this.pesticides   = r.pesticides || [];
        this.parcels      = r.parcels || [];
        if (this.parcels.length > 0) {
          this.selectedParcelId = this.parcels[0].id;
          this.form.parcel_id   = this.parcels[0].id;
          this.loadLog(this.parcels[0].id);
        } else {
          this.isLoading = false;
        }
      }
    });
  }

  loadLog(id: number) {
    this.isLoading = true;
    this.treatmentsService.getTreatmentLog(id).subscribe({
      next: (r: any) => { this.treatmentLog = r || []; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  logTreatment() {
    this.treatmentsService.logTreatment(this.form).subscribe({
      next: () => {
        this.showForm = false;
        this.loadLog(this.selectedParcelId!);
      }
    });
  }

  getDarStatus(days: number): string {
    if (days <= 0) return 'safe';
    if (days <= 3) return 'warning';
    return 'waiting';
  }
}`,
    html: `<div class="page-container">
  <div class="page-header-row">
    <div>
      <h1> Traitements / المعالجات</h1>
      <p class="page-sub">Suivi des traitements et délais avant récolte</p>
    </div>
    <button class="btn-add" (click)="showForm = !showForm">
      {{ showForm ? ' Annuler' : ' Enregistrer traitement' }}
    </button>
  </div>

  <div class="form-card" *ngIf="showForm">
    <h3> Nouveau traitement</h3>
    <div class="form-grid">
      <div class="form-group">
        <label>Parcelle</label>
        <select [(ngModel)]="form.parcel_id" name="parcel">
          <option *ngFor="let p of parcels" [value]="p.id">{{ p.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Produit / المنتج</label>
        <input type="text" [(ngModel)]="form.product"
               placeholder="Ex: Mancozèbe 80 WP" name="product"/>
      </div>
      <div class="form-group">
        <label>Dose / الجرعة</label>
        <input type="text" [(ngModel)]="form.dose"
               placeholder="Ex: 2.5 kg/ha" name="dose"/>
      </div>
      <div class="form-group">
        <label>Date application</label>
        <input type="date" [(ngModel)]="form.date_applied" name="date"/>
      </div>
      <div class="form-group">
        <label>Maladie traitée</label>
        <input type="text" [(ngModel)]="form.disease_treated"
               placeholder="Ex: Mildiou" name="disease"/>
      </div>
      <div class="form-group">
        <label>DAR (jours)</label>
        <input type="number" [(ngModel)]="form.dar_days" name="dar"/>
      </div>
    </div>
    <button class="btn-submit" (click)="logTreatment()">
       Enregistrer
    </button>
  </div>

  <div class="tab-bar">
    <button class="tab-btn" [class.active]="activeTab==='reminders'"
            (click)="activeTab='reminders'">
       Rappels DAR
      <span class="tab-count" *ngIf="darReminders.length">
        {{ darReminders.length }}
      </span>
    </button>
    <button class="tab-btn" [class.active]="activeTab==='log'"
            (click)="activeTab='log'"> Historique</button>
    <button class="tab-btn" [class.active]="activeTab==='pesticides'"
            (click)="activeTab='pesticides'"> Pesticides</button>
  </div>

  <div *ngIf="activeTab === 'reminders'">
    <div class="empty-state" *ngIf="darReminders.length === 0">
      <span></span><p>Aucun rappel DAR actif</p>
    </div>
    <div class="dar-card"
         *ngFor="let r of darReminders"
         [class]="'dar-' + getDarStatus(r.days_remaining)">
      <div class="dar-info">
        <h3>{{ r.parcel_name }} — {{ r.product }}</h3>
        <p>Appliqué le {{ r.date_applied | date:'dd/MM/yyyy' }}</p>
        <p>Récolte autorisée : {{ r.harvest_allowed_from | date:'dd/MM/yyyy' }}</p>
      </div>
      <div class="dar-countdown">
        <span class="dar-days">{{ r.days_remaining }}</span>
        <span class="dar-unit">jours restants</span>
        <span class="dar-safe" *ngIf="r.is_safe"> Sûr</span>
        <span class="dar-wait" *ngIf="!r.is_safe"> Attendre</span>
      </div>
    </div>
  </div>

  <div *ngIf="activeTab === 'log'">
    <div class="parcel-selector">
      <button class="parcel-tab"
              *ngFor="let p of parcels"
              [class.active]="selectedParcelId === p.id"
              (click)="selectedParcelId=p.id; loadLog(p.id)">
         {{ p.name }}
      </button>
    </div>
    <div class="log-list">
      <div class="log-item" *ngFor="let t of treatmentLog">
        <div class="log-icon"></div>
        <div class="log-info">
          <strong>{{ t.product }}</strong>
          <span>{{ t.dose }}</span>
          <span>{{ t.date_applied | date:'dd/MM/yyyy' }}</span>
          <span *ngIf="t.disease_treated"> {{ t.disease_treated }}</span>
        </div>
        <div class="log-dar">
          DAR: {{ t.dar_days }}j
        </div>
      </div>
      <div class="empty-state" *ngIf="treatmentLog.length === 0">
        <span></span><p>Aucun traitement enregistré</p>
      </div>
    </div>
  </div>

  <div *ngIf="activeTab === 'pesticides'">
    <div class="pesticide-card"
         *ngFor="let p of pesticides">
      <div class="pest-header">
        <h3>{{ p.name }}</h3>
        <span class="pest-homo">{{ p.homologation }}</span>
      </div>
      <div class="pest-details">
        <span> {{ p.active_substance }}</span>
        <span> {{ p.dose }}</span>
        <span> DAR: {{ p.dar_days }}j</span>
        <span> Classe {{ p.toxicity_class }}</span>
      </div>
      <div class="pest-targets">
        <span class="target-tag"
              *ngFor="let d of p.target_diseases">
          {{ d }}
        </span>
      </div>
    </div>
  </div>
</div>`,
    css: `.page-container{max-width:900px;margin:0 auto;}
.page-header-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:12px;}
.page-header-row h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.btn-add{padding:10px 18px;background:#1a5c2e;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;}
.form-card{background:white;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.form-card h3{font-size:15px;font-weight:700;margin-bottom:16px;}
.form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:16px;}
.form-group{display:flex;flex-direction:column;gap:6px;}
.form-group label{font-size:12px;font-weight:600;color:#374151;}
.form-group input,.form-group select{padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;}
.btn-submit{padding:11px 24px;background:#1a5c2e;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;}
.tab-bar{display:flex;gap:4px;background:white;border-radius:12px;padding:6px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.tab-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;background:none;cursor:pointer;font-size:13px;color:#6b7280;transition:all 0.2s;}
.tab-btn.active{background:#1a5c2e;color:white;font-weight:600;}
.tab-count{background:rgba(255,255,255,0.3);padding:1px 6px;border-radius:10px;font-size:11px;}
.empty-state{display:flex;flex-direction:column;align-items:center;padding:40px;gap:8px;color:#6b7280;}
.empty-state span{font-size:40px;}
.dar-card{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-radius:12px;margin-bottom:10px;border-left:4px solid;}
.dar-safe{background:#f0fdf4;border-color:#10b981;}
.dar-warning{background:#fffbeb;border-color:#f59e0b;}
.dar-waiting{background:#fff7ed;border-color:#ef4444;}
.dar-info h3{font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
.dar-info p{font-size:12px;color:#6b7280;}
.dar-countdown{text-align:center;}
.dar-days{display:block;font-size:28px;font-weight:800;color:#1a1a1a;}
.dar-unit{display:block;font-size:11px;color:#6b7280;margin-bottom:4px;}
.dar-safe,.dar-wait{font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;}
.dar-safe{background:#dcfce7;color:#059669;}
.dar-wait{background:#fef3c7;color:#d97706;}
.parcel-selector{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.parcel-tab{padding:8px 16px;border-radius:20px;border:1px solid #e5e7eb;background:white;cursor:pointer;font-size:13px;}
.parcel-tab.active{background:#1a5c2e;color:white;}
.log-list{display:flex;flex-direction:column;gap:8px;}
.log-item{display:flex;align-items:center;gap:12px;background:white;border-radius:10px;padding:12px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
.log-icon{font-size:24px;}
.log-info{flex:1;display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
.log-info strong{font-size:14px;color:#1a1a1a;width:100%;}
.log-info span{font-size:12px;color:#6b7280;}
.log-dar{background:#eff6ff;color:#1d4ed8;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600;}
.pesticide-card{background:white;border-radius:12px;padding:16px 20px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.pest-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.pest-header h3{font-size:15px;font-weight:700;color:#1a1a1a;}
.pest-homo{font-size:11px;background:#f0fdf4;color:#059669;padding:3px 10px;border-radius:20px;}
.pest-details{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;}
.pest-details span{font-size:12px;color:#6b7280;}
.pest-targets{display:flex;flex-wrap:wrap;gap:6px;}
.target-tag{background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:11px;}`
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
console.log("2 more components generated");
