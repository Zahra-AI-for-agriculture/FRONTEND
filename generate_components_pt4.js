const fs = require('fs');
const path = require('path');

const cleanEmojis = (str) => {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{25B6}\u{23F1}-\u{23F3}\u{23E9}-\u{23EC}\u{2139}\u{2192}\u{2193}\u{2191}\u{2714}\u{274C}\u{FE0F}\u{200D}\u{2B55}\u{2705}\u{1F9A0}-\u{1F9FF}]/gu, '');
};

const components = {
  'community': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { CommunityService } from '../../../services/community.service';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  posts: any[] = [];
  advisors: any[] = [];
  selectedPost: any = null;
  replies: any[] = [];
  isLoading = true;
  activeTab = 'forum';
  showNewPost = false;

  newPost = { title: '', body_ar: '', crop: '', region: '' };
  newReply = { body_ar: '' };

  communityService = {
    getPosts: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getAdvisors: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getReplies: (id: any) => ({ subscribe: (cb: any) => cb.next([]) }),
    createPost: (data: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    addReply: (id: any, data: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    messageAdvisor: (id: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor() {}

  ngOnInit() {
    forkJoin({
      posts:    this.communityService.getPosts() as any,
      advisors: this.communityService.getAdvisors() as any,
    }).subscribe({
      next: (r: any) => {
        this.posts    = r.posts || [];
        this.advisors = r.advisors?.advisors || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  selectPost(post: any) {
    this.selectedPost = post;
    this.communityService.getReplies(post.id).subscribe({
      next: (r: any) => { this.replies = r || []; }
    });
  }

  createPost() {
    if (!this.newPost.title || !this.newPost.body_ar) return;
    this.communityService.createPost(this.newPost).subscribe({
      next: (p: any) => {
        this.posts.unshift(p);
        this.showNewPost = false;
        this.newPost = { title:'', body_ar:'', crop:'', region:'' };
      }
    });
  }

  addReply() {
    if (!this.newReply.body_ar || !this.selectedPost) return;
    this.communityService.addReply(this.selectedPost.id, this.newReply)
      .subscribe({
        next: (r: any) => {
          this.replies.push(r);
          this.newReply = { body_ar: '' };
        }
      });
  }

  contactAdvisor(id: number) {
    this.communityService.messageAdvisor(id).subscribe();
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Communauté / المجتمع</h1>
    <p class="page-sub">Forum agriculteurs + Conseillers agronomes</p>
  </div>

  <div class="tab-bar">
    <button class="tab-btn" [class.active]="activeTab==='forum'"
            (click)="activeTab='forum';selectedPost=null">
       Forum
    </button>
    <button class="tab-btn" [class.active]="activeTab==='advisors'"
            (click)="activeTab='advisors'">
       Conseillers
    </button>
  </div>

  <div *ngIf="activeTab === 'forum'">
    <button class="btn-new-post" (click)="showNewPost = !showNewPost">
      {{ showNewPost ? ' Annuler' : ' Nouveau post / منشور جديد' }}
    </button>

    <div class="new-post-form" *ngIf="showNewPost">
      <div class="form-group">
        <label>Titre / العنوان</label>
        <input type="text" [(ngModel)]="newPost.title"
               name="title" placeholder="Sujet de votre question..."/>
      </div>
      <div class="form-group">
        <label>Message / الرسالة</label>
        <textarea [(ngModel)]="newPost.body_ar" name="body"
                  rows="3" placeholder="Décrivez votre problème...">
        </textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Culture / المحصول</label>
          <input type="text" [(ngModel)]="newPost.crop" name="crop"/>
        </div>
        <div class="form-group">
          <label>Région / المنطقة</label>
          <input type="text" [(ngModel)]="newPost.region" name="region"/>
        </div>
      </div>
      <button class="btn-submit" (click)="createPost()">
         Publier
      </button>
    </div>

    <div class="posts-layout" *ngIf="!selectedPost">
      <div class="post-card"
           *ngFor="let post of posts"
           (click)="selectPost(post)">
        <div class="post-header">
          <span class="post-crop" *ngIf="post.crop">{{ post.crop }}</span>
          <span class="post-region" *ngIf="post.region">{{ post.region }}</span>
        </div>
        <h3>{{ post.title }}</h3>
        <p class="post-body">{{ post.body_ar }}</p>
        <div class="post-footer">
          <span> {{ post.likes || 0 }}</span>
          <span> Voir les réponses </span>
        </div>
      </div>
    </div>

    <div class="post-detail" *ngIf="selectedPost">
      <button class="btn-back-post" (click)="selectedPost=null">
         Retour
      </button>
      <div class="post-card selected">
        <h3>{{ selectedPost.title }}</h3>
        <p>{{ selectedPost.body_ar }}</p>
      </div>
      <h4 class="replies-title">
         Réponses ({{ replies.length }})
      </h4>
      <div class="reply-item" *ngFor="let r of replies">
        <div class="reply-avatar">
          {{ r.farmer_id }}
        </div>
        <div class="reply-content">
          <p>{{ r.body_ar }}</p>
          <span>{{ r.created_at | date:'dd/MM HH:mm' }}</span>
        </div>
      </div>
      <div class="reply-form">
        <textarea [(ngModel)]="newReply.body_ar" name="reply"
                  rows="2" placeholder="Votre réponse...">
        </textarea>
        <button class="btn-reply" (click)="addReply()">
           Répondre
        </button>
      </div>
    </div>

  </div>

  <div *ngIf="activeTab === 'advisors'">
    <div class="advisors-grid">
      <div class="advisor-card"
           *ngFor="let a of advisors">
        <div class="advisor-avatar">
          {{ a.name?.charAt(0) }}
        </div>
        <div class="advisor-info">
          <h3>{{ a.name }}</h3>
          <span class="advisor-spec">{{ a.specialty }}</span>
          <span class="advisor-region"> {{ a.region }}</span>
        </div>
        <div class="advisor-actions">
          <span class="advisor-status"
                [class.available]="a.available">
            {{ a.available ? ' Disponible' : ' Occupé' }}
          </span>
          <button class="btn-contact"
                  [disabled]="!a.available"
                  (click)="contactAdvisor(a.id)">
             Contacter
          </button>
        </div>
      </div>
    </div>
    <div class="empty-state" *ngIf="advisors.length === 0">
      <span></span><p>Aucun conseiller disponible</p>
    </div>
  </div>

</div>`,
    css: `.page-container{max-width:900px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.tab-bar{display:flex;gap:4px;background:white;border-radius:12px;padding:6px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.tab-btn{padding:8px 16px;border:none;border-radius:8px;background:none;cursor:pointer;font-size:13px;color:#6b7280;transition:all 0.2s;}
.tab-btn.active{background:#1a5c2e;color:white;font-weight:600;}
.btn-new-post{width:100%;padding:12px;background:white;border:2px dashed #2d8a4e;border-radius:12px;color:#2d8a4e;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px;transition:all 0.2s;}
.btn-new-post:hover{background:#f0fdf4;}
.new-post-form{background:white;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
.form-group label{font-size:12px;font-weight:600;color:#374151;}
.form-group input,.form-group textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.btn-submit{padding:10px 20px;background:#1a5c2e;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;}
.posts-layout{display:flex;flex-direction:column;gap:12px;}
.post-card{background:white;border-radius:12px;padding:16px 20px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #e5e7eb;}
.post-card:hover,.post-card.selected{border-color:#2d8a4e;box-shadow:0 4px 16px rgba(45,138,78,0.15);}
.post-header{display:flex;gap:8px;margin-bottom:8px;}
.post-crop{background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.post-region{background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:11px;}
.post-card h3{font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:6px;}
.post-body{font-size:13px;color:#6b7280;line-height:1.5;margin-bottom:10px;}
.post-footer{display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;}
.post-detail{display:flex;flex-direction:column;gap:12px;}
.btn-back-post{background:none;border:none;color:#2d8a4e;font-size:14px;font-weight:600;cursor:pointer;text-align:left;padding:0;}
.replies-title{font-size:14px;font-weight:700;color:#374151;}
.reply-item{display:flex;gap:10px;background:white;border-radius:10px;padding:12px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
.reply-avatar{width:32px;height:32px;background:#e5e7eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#6b7280;flex-shrink:0;}
.reply-content p{font-size:14px;color:#1a1a1a;}
.reply-content span{font-size:11px;color:#9ca3af;}
.reply-form{display:flex;gap:10px;align-items:flex-end;}
.reply-form textarea{flex:1;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;resize:none;}
.btn-reply{padding:10px 16px;background:#1a5c2e;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;}
.advisors-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
.advisor-card{background:white;border-radius:14px;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:12px;}
.advisor-avatar{width:48px;height:48px;background:#1a5c2e;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;}
.advisor-info h3{font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px;}
.advisor-spec{display:block;background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:4px;display:inline-block;}
.advisor-region{font-size:13px;color:#6b7280;display:block;}
.advisor-actions{display:flex;align-items:center;justify-content:space-between;}
.advisor-status{font-size:12px;}
.advisor-status.available{color:#059669;}
.btn-contact{padding:8px 14px;background:#1a5c2e;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;}
.btn-contact:disabled{opacity:0.5;cursor:not-allowed;}
.empty-state{display:flex;flex-direction:column;align-items:center;padding:40px;gap:8px;color:#6b7280;}
.empty-state span{font-size:40px;}`
  },
  'reports': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  dashboard: any = null;
  financial: any = null;
  sustainability: any = null;
  isLoading = true;
  activeTab = 'overview';

  reportsService = {
    getDashboard: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getFinancial: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getSustainability: () => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor() {}

  ngOnInit() {
    forkJoin({
      dash:   this.reportsService.getDashboard() as any,
      fin:    this.reportsService.getFinancial() as any,
      sustain:this.reportsService.getSustainability() as any,
    }).subscribe({
      next: (r: any) => {
        this.dashboard     = r.dash;
        this.financial     = r.fin;
        this.sustainability = r.sustain;
        this.isLoading     = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getIndicators(): any[] {
    if (!this.sustainability?.indicators) return [];
    return Object.entries(this.sustainability.indicators).map(
      ([key, val]) => ({
        name: key.replace('_', ' '),
        value: val
      })
    );
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Rapports / التقارير</h1>
    <p class="page-sub">Bilan de votre exploitation agricole</p>
  </div>

  <div class="tab-bar">
    <button class="tab-btn" [class.active]="activeTab==='overview'"
            (click)="activeTab='overview'"> Vue globale</button>
    <button class="tab-btn" [class.active]="activeTab==='financial'"
            (click)="activeTab='financial'"> Finances</button>
    <button class="tab-btn" [class.active]="activeTab==='sustainability'"
            (click)="activeTab='sustainability'"> Durabilité</button>
  </div>

  <div class="loading-state" *ngIf="isLoading">
    <div class="spin"></div><p>Chargement...</p>
  </div>

  <div *ngIf="!isLoading && activeTab === 'overview' && dashboard">
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon"></div>
        <div class="kpi-val">{{ dashboard.summary?.total_parcels }}</div>
        <div class="kpi-lbl">Parcelles</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"></div>
        <div class="kpi-val">{{ dashboard.summary?.total_area_ha }} ha</div>
        <div class="kpi-lbl">Surface totale</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"></div>
        <div class="kpi-val">{{ dashboard.summary?.active_crops?.length }}</div>
        <div class="kpi-lbl">Cultures actives</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"></div>
        <div class="kpi-val">{{ dashboard.summary?.unread_alerts }}</div>
        <div class="kpi-lbl">Alertes non lues</div>
      </div>
    </div>

    <div class="parcels-report">
      <h3> Mes parcelles</h3>
      <div class="parcel-report-row"
           *ngFor="let p of dashboard.parcels || []">
        <strong>{{ p.name }}</strong>
        <span>{{ p.crop }}</span>
        <span>{{ p.area_ha }} ha</span>
        <span *ngIf="p.health_score"> {{ p.health_score }}/100</span>
        <span *ngIf="p.ndvi"> NDVI: {{ p.ndvi }}</span>
      </div>
    </div>
  </div>

  <div *ngIf="!isLoading && activeTab === 'financial' && financial">
    <div class="finance-hero">
      <div class="finance-item profit">
        <span class="fi-icon"></span>
        <div>
          <span class="fi-label">Bénéfice estimé / الربح المتوقع</span>
          <span class="fi-val">{{ financial.estimated_profit_dt | number }} DT</span>
        </div>
      </div>
    </div>
    <div class="finance-grid">
      <div class="finance-card revenue">
        <h4> Revenus estimés</h4>
        <div class="fin-amount">{{ financial.estimated_revenue_dt | number }} DT</div>
      </div>
      <div class="finance-card costs">
        <h4> Coûts estimés</h4>
        <div class="fin-amount">{{ financial.estimated_costs_dt | number }} DT</div>
      </div>
    </div>
    <div class="finance-bar">
      <div class="fb-label">Marge bénéficiaire</div>
      <div class="fb-track">
        <div class="fb-fill"
             [style.width.%]="(financial.estimated_profit_dt / financial.estimated_revenue_dt) * 100">
        </div>
      </div>
      <div class="fb-pct">
        {{ ((financial.estimated_profit_dt / financial.estimated_revenue_dt) * 100) | number:'1.0-0' }}%
      </div>
    </div>
  </div>

  <div *ngIf="!isLoading && activeTab === 'sustainability' && sustainability">
    <div class="sustain-score">
      <div class="ss-circle">
        <span class="ss-val">{{ sustainability.global_score }}</span>
        <span class="ss-lbl">/100</span>
      </div>
      <h3>Score de durabilité / درجة الاستدامة</h3>
    </div>
    <div class="indicators-grid">
      <div class="indicator-card"
           *ngFor="let ind of getIndicators()">
        <div class="ind-name">{{ ind.name }}</div>
        <div class="ind-bar">
          <div class="ind-fill" [style.width.%]="ind.value"></div>
        </div>
        <div class="ind-val">{{ ind.value }}/100</div>
      </div>
    </div>
    <div class="recommendations">
      <h4> Recommandations</h4>
      <div class="rec-item"
           *ngFor="let r of sustainability.recommendations_fr || []">
         {{ r }}
      </div>
    </div>
  </div>

</div>`,
    css: `.page-container{max-width:900px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.tab-bar{display:flex;gap:4px;background:white;border-radius:12px;padding:6px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.tab-btn{padding:8px 16px;border:none;border-radius:8px;background:none;cursor:pointer;font-size:13px;color:#6b7280;transition:all 0.2s;}
.tab-btn.active{background:#1a5c2e;color:white;font-weight:600;}
.loading-state{display:flex;flex-direction:column;align-items:center;min-height:300px;justify-content:center;gap:12px;color:#6b7280;}
.spin{font-size:48px;animation:spin 2s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;}
.kpi-card{background:white;border-radius:14px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.kpi-icon{font-size:28px;margin-bottom:8px;}
.kpi-val{font-size:24px;font-weight:800;color:#1a5c2e;margin-bottom:4px;}
.kpi-lbl{font-size:12px;color:#6b7280;}
.parcels-report{background:white;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.parcels-report h3{font-size:15px;font-weight:700;margin-bottom:14px;}
.parcel-report-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;}
.parcel-report-row strong{color:#1a1a1a;min-width:120px;}
.parcel-report-row span{color:#6b7280;}
.finance-hero{background:linear-gradient(135deg,#1a5c2e,#2d8a4e);border-radius:16px;padding:24px;margin-bottom:20px;color:white;}
.finance-item.profit{display:flex;align-items:center;gap:16px;}
.fi-icon{font-size:48px;}
.fi-label{display:block;font-size:14px;opacity:0.8;margin-bottom:4px;}
.fi-val{display:block;font-size:36px;font-weight:800;}
.finance-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.finance-card{background:white;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.finance-card h4{font-size:13px;font-weight:600;color:#6b7280;margin-bottom:8px;}
.finance-card.revenue .fin-amount{color:#059669;font-size:24px;font-weight:800;}
.finance-card.costs .fin-amount{color:#dc2626;font-size:24px;font-weight:800;}
.finance-bar{background:white;border-radius:14px;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.fb-label{font-size:13px;color:#6b7280;margin-bottom:8px;}
.fb-track{height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;margin-bottom:6px;}
.fb-fill{height:100%;background:#1a5c2e;border-radius:5px;}
.fb-pct{font-size:14px;font-weight:700;color:#1a5c2e;}
.sustain-score{display:flex;flex-direction:column;align-items:center;margin-bottom:24px;}
.ss-circle{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#1a5c2e,#2d8a4e);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;margin-bottom:8px;}
.ss-val{font-size:28px;font-weight:800;}
.ss-lbl{font-size:12px;opacity:0.8;}
.sustain-score h3{font-size:16px;font-weight:700;color:#1a1a1a;}
.indicators-grid{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.indicator-card{background:white;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
.ind-name{min-width:140px;font-size:13px;color:#374151;text-transform:capitalize;}
.ind-bar{flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;}
.ind-fill{height:100%;background:#1a5c2e;border-radius:4px;}
.ind-val{font-size:13px;font-weight:700;color:#1a5c2e;min-width:50px;text-align:right;}
.recommendations{background:white;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.recommendations h4{font-size:14px;font-weight:700;margin-bottom:12px;}
.rec-item{font-size:13px;color:#374151;padding:6px 0;border-bottom:1px solid #f3f4f6;}`
  },
  'knowledge': {
    ts: `import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { KnowledgeService } from '../../../services/knowledge.service';

@Component({
  selector: 'app-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.css']
})
export class KnowledgeComponent implements OnInit {
  crops: any[] = [];
  subsidies: any[] = [];
  seeds: any[] = [];
  calendar: any = null;
  isLoading = true;
  activeTab = 'crops';
  selectedCrop = '';
  selectedRegion = '';

  knowledgeService = {
    getCrops: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getSubsidies: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getSeeds: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getCalendar: (c: any, r: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor() {}

  ngOnInit() {
    forkJoin({
      crops:     this.knowledgeService.getCrops() as any,
      subsidies: this.knowledgeService.getSubsidies() as any,
      seeds:     this.knowledgeService.getSeeds() as any,
    }).subscribe({
      next: (r: any) => {
        this.crops     = r.crops?.crops || [];
        this.subsidies = r.subsidies?.subsidies || [];
        this.seeds     = r.seeds?.seeds || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadCalendar() {
    if (!this.selectedCrop || !this.selectedRegion) return;
    this.knowledgeService.getCalendar(
      this.selectedCrop, this.selectedRegion
    ).subscribe({
      next: (c: any) => { this.calendar = c; }
    });
  }

  getCalendarEntries(): any[] {
    if (!this.calendar?.calendar) return [];
    return Object.entries(this.calendar.calendar).map(
      ([stage, period]) => ({ stage, period })
    );
  }
}`,
    html: `<div class="page-container">
  <div class="page-header">
    <h1> Connaissances / المعرفة</h1>
    <p class="page-sub">Base de données agricole tunisienne</p>
  </div>

  <div class="tab-bar">
    <button class="tab-btn" [class.active]="activeTab==='crops'"
            (click)="activeTab='crops'"> Cultures</button>
    <button class="tab-btn" [class.active]="activeTab==='calendar'"
            (click)="activeTab='calendar'"> Calendrier</button>
    <button class="tab-btn" [class.active]="activeTab==='subsidies'"
            (click)="activeTab='subsidies'"> Aides</button>
    <button class="tab-btn" [class.active]="activeTab==='seeds'"
            (click)="activeTab='seeds'"> Semences</button>
  </div>

  <div class="loading-state" *ngIf="isLoading">
    <div class="spin"></div><p>Chargement...</p>
  </div>

  <div *ngIf="!isLoading && activeTab === 'crops'">
    <div class="crops-grid">
      <div class="crop-card" *ngFor="let c of crops">
        <div class="crop-header">
          <h3>{{ c.name }}</h3>
          <span class="crop-name-ar">{{ c.name_ar }}</span>
        </div>
        <div class="crop-details">
          <div class="cd-item">
            <span> Saison</span>
            <strong>{{ c.season }}</strong>
          </div>
          <div class="cd-item">
            <span> Besoin eau</span>
            <strong>{{ c.water_need_mm }} mm</strong>
          </div>
          <div class="cd-item">
            <span> Température</span>
            <strong>{{ c.optimal_temp }}</strong>
          </div>
          <div class="cd-item">
            <span> Régions</span>
            <strong>{{ c.regions?.join(', ') }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="!isLoading && activeTab === 'calendar'">
    <div class="calendar-selector">
      <div class="form-group">
        <label>Culture / المحصول</label>
        <select [(ngModel)]="selectedCrop" name="crop">
          <option value="">-- Choisir --</option>
          <option *ngFor="let c of crops" [value]="c.name">{{ c.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Région / المنطقة</label>
        <select [(ngModel)]="selectedRegion" name="region">
          <option value="">-- Choisir --</option>
          <option value="Béja">Béja</option>
          <option value="Sidi Bouzid">Sidi Bouzid</option>
          <option value="Sfax">Sfax</option>
          <option value="Nabeul">Nabeul</option>
          <option value="Sousse">Sousse</option>
          <option value="Kairouan">Kairouan</option>
        </select>
      </div>
      <button class="btn-load-cal" (click)="loadCalendar()">
         Charger le calendrier
      </button>
    </div>

    <div class="calendar-result" *ngIf="calendar">
      <h3>
         {{ calendar.crop }} — {{ calendar.region }}
      </h3>
      <div class="calendar-stages">
        <div class="stage-item"
             *ngFor="let s of getCalendarEntries(); let i = index">
          <div class="stage-number">{{ i + 1 }}</div>
          <div class="stage-info">
            <strong>{{ s.stage | titlecase }}</strong>
            <span>{{ s.period }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="!isLoading && activeTab === 'subsidies'">
    <div class="subsidy-card" *ngFor="let s of subsidies">
      <div class="sub-header">
        <h3>{{ s.name }}</h3>
        <span class="sub-org">{{ s.organism }}</span>
      </div>
      <p class="sub-desc">{{ s.description }}</p>
      <div class="sub-details">
        <span class="sub-amount"> {{ s.amount }}</span>
        <span class="sub-crops"> {{ s.crops }}</span>
        <a [href]="'https://' + s.contact" target="_blank"
           class="sub-link"> {{ s.contact }}</a>
      </div>
    </div>
  </div>

  <div *ngIf="!isLoading && activeTab === 'seeds'">
    <div class="seeds-table">
      <div class="seed-row header-row">
        <span>Variété</span>
        <span>Culture</span>
        <span>Cycle</span>
        <span>Potentiel</span>
        <span>Résistance</span>
      </div>
      <div class="seed-row" *ngFor="let s of seeds">
        <strong>{{ s.name }}</strong>
        <span>{{ s.crop }}</span>
        <span>{{ s.cycle }}</span>
        <span>{{ s.yield_potential }}</span>
        <span class="resistance-tag">{{ s.resistance }}</span>
      </div>
    </div>
  </div>

</div>`,
    css: `.page-container{max-width:1000px;margin:0 auto;}
.page-header{margin-bottom:24px;}
.page-header h1{font-size:24px;font-weight:700;color:#1a1a1a;}
.page-sub{font-size:14px;color:#6b7280;}
.tab-bar{display:flex;gap:4px;background:white;border-radius:12px;padding:6px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow-x:auto;}
.tab-btn{padding:8px 16px;border:none;border-radius:8px;background:none;cursor:pointer;font-size:13px;color:#6b7280;transition:all 0.2s;white-space:nowrap;}
.tab-btn.active{background:#1a5c2e;color:white;font-weight:600;}
.loading-state{display:flex;flex-direction:column;align-items:center;min-height:300px;justify-content:center;gap:12px;color:#6b7280;}
.spin{font-size:48px;animation:spin 2s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.crops-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
.crop-card{background:white;border-radius:14px;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.crop-header{margin-bottom:12px;}
.crop-header h3{font-size:16px;font-weight:700;color:#1a1a1a;}
.crop-name-ar{font-size:14px;color:#6b7280;}
.crop-details{display:flex;flex-direction:column;gap:8px;}
.cd-item{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid #f3f4f6;}
.cd-item span{color:#6b7280;}
.cd-item strong{color:#1a1a1a;}
.calendar-selector{background:white;border-radius:14px;padding:20px;margin-bottom:20px;display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.form-group{display:flex;flex-direction:column;gap:6px;min-width:160px;}
.form-group label{font-size:12px;font-weight:600;color:#374151;}
.form-group select{padding:9px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;}
.btn-load-cal{padding:10px 18px;background:#1a5c2e;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;}
.calendar-result{background:white;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.calendar-result h3{font-size:16px;font-weight:700;margin-bottom:16px;}
.calendar-stages{display:flex;flex-direction:column;gap:8px;}
.stage-item{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#f8faf8;border-radius:10px;}
.stage-number{width:28px;height:28px;background:#1a5c2e;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
.stage-info strong{display:block;font-size:14px;color:#1a1a1a;}
.stage-info span{font-size:13px;color:#6b7280;}
.subsidy-card{background:white;border-radius:14px;padding:16px 20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.sub-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.sub-header h3{font-size:15px;font-weight:700;color:#1a1a1a;}
.sub-org{background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.sub-desc{font-size:13px;color:#374151;margin-bottom:10px;line-height:1.5;}
.sub-details{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
.sub-amount{background:#dcfce7;color:#166534;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;}
.sub-crops{font-size:12px;color:#6b7280;}
.sub-link{color:#2d8a4e;font-size:12px;text-decoration:none;}
.seeds-table{background:white;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.seed-row{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;gap:12px;padding:12px 16px;font-size:13px;}
.seed-row:nth-child(even){background:#f8faf8;}
.header-row{background:#1a5c2e!important;color:white;font-weight:700;}
.seed-row strong{color:#1a1a1a;}
.seed-row span{color:#6b7280;}
.resistance-tag{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:20px;font-size:11px;}`
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
