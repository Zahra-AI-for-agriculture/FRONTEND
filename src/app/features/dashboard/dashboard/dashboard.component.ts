import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as L from 'leaflet';
import { ReportsService } from '../../../services/reports.service';
import { WeatherService } from '../../../services/weather.service';
import { AIService } from '../../../services/ai.service';
import { AlertsService } from '../../../services/alerts.service';
import { MarketService } from '../../../services/market.service';
import { ParcelsService } from '../../../services/parcels.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoading   = true;
  farmerName  = localStorage.getItem('zahra_farmer_name') || 'Agriculteur';
  governorate = '';

  summary: any      = {};
  parcels: any[]    = [];
  weather: any      = null;
  aiStatus: any     = null;
  alerts: any[]     = [];
  marketPrices: any = {};
  unreadCount       = 0;

  // Map state
  private map: L.Map | null = null;
  private parcelsLayerGroup: L.FeatureGroup | null = null;
  mapReady = false;

  activeTab = 'overview';

  readonly tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '' },
    { id: 'parcels',  label: 'Parcelles',        icon: '️' },
    { id: 'ai',       label: 'Modèles IA',        icon: '' },
    { id: 'weather',  label: 'Météo',             icon: '️' },
    { id: 'market',   label: 'Marché',            icon: '' },
  ];

  readonly aiModels = [
    { key: 'm1_disease',      label: 'Diagnostic maladie', icon: '', route: '/ai/disease'    },
    { key: 'm2_yield',        label: 'Rendement',          icon: '', route: '/ai/yield'      },
    { key: 'm3_drought',      label: 'Sécheresse',         icon: '️', route: '/ai/drought'    },
    { key: 'm4_segmentation', label: 'Segmentation',       icon: '️', route: '/parcels'       },
    { key: 'm5_irrigation',   label: 'Irrigation',         icon: '', route: '/ai/irrigation' },
    { key: 'm6_ndvi',         label: 'Anomalie NDVI',      icon: '', route: '/parcels'       },
    { key: 'm7_pest',         label: 'Ravageurs',          icon: '', route: '/ai/pest'       },
  ];

  private readonly cropColors: Record<string, string> = {
    'Olivier': '#10b981',
    'Blé dur': '#f59e0b',
    'Tomate':  '#ef4444',
    'Piment':  '#f97316',
    'Agrumes': '#eab308',
    'Orge':    '#84cc16',
    'Grenade': '#ec4899',
    'Fève':    '#8b5cf6',
  };

  constructor(
    private reportsService: ReportsService,
    private weatherService: WeatherService,
    private aiService:      AIService,
    private alertsService:  AlertsService,
    private marketService:  MarketService,
    private parcelsService: ParcelsService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      if (this.parcels.length > 0) {
        setTimeout(() => this.displayParcelsOnMap(), 500);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // ── Map ──

  private initMap(): void {
    const el = document.getElementById('dashboard-map');
    if (!el || this.map) return;

    this.map = L.map('dashboard-map', {
      center:      [33.8869, 9.5375],
      zoom:        7,
      zoomControl: true,
    });

    L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        subdomains:    ['0', '1', '2', '3'],
        attribution:   ' Google Maps',
        maxZoom:       21,
        maxNativeZoom: 20,
      } as any
    ).addTo(this.map);

    this.parcelsLayerGroup = L.featureGroup().addTo(this.map);

    this.mapReady = true;
    console.log('[MAP] Initialisée ');

    if (this.parcels && this.parcels.length > 0) {
      console.log('[MAP] Parcelles déjà disponibles → affichage immédiat');
      setTimeout(() => this.displayParcelsOnMap(), 300);
    }
  }

  private displayParcelsOnMap(): void {
    if (!this.map || !this.mapReady || !this.parcelsLayerGroup) {
      console.warn('[MAP] Pas prête:', {
        map:   !!this.map,
        ready: this.mapReady,
        group: !!this.parcelsLayerGroup,
      });
      return;
    }

    console.log('[MAP] Affichage de', this.parcels.length, 'parcelles');
    this.parcelsLayerGroup.clearLayers();

    const allBounds: L.LatLngBounds[] = [];

    this.parcels.forEach((parcel) => {
      if (!parcel.polygon_geojson) {
        console.warn('[MAP] Pas de polygon_geojson pour:', parcel.name);
        return;
      }

      try {
        const color = this.getLegendColor(parcel.crop);
        const geoJson = typeof parcel.polygon_geojson === 'string'
          ? JSON.parse(parcel.polygon_geojson)
          : parcel.polygon_geojson;

        console.log('[MAP] Ajout parcelle:', parcel.name, geoJson.type);

        const polygonLayer = L.geoJSON(geoJson as any, {
          style: {
            color,
            weight:      3,
            opacity:     1.0,
            fillColor:   color,
            fillOpacity: 0.3,
          }
        }).addTo(this.parcelsLayerGroup!);

        const bounds = polygonLayer.getBounds();
        if (!bounds.isValid()) {
          console.warn('[MAP] Bounds invalides pour:', parcel.name);
          return;
        }

        const center = bounds.getCenter();
        console.log('[MAP] Centre parcelle:', center);

        const labelIcon = L.divIcon({
          className: '',
          html: `<div style="
            background:white;
            border:2px solid ${color};
            border-radius:8px;
            padding:4px 10px;
            font-family:'Segoe UI',sans-serif;
            font-size:12px;
            font-weight:700;
            color:#1a1a1a;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
          ">${parcel.name}</div>`,
          iconAnchor: [40, 10],
        });

        L.marker(center, {
          icon:         labelIcon,
          interactive:  false,
          zIndexOffset: 1000,
        }).addTo(this.parcelsLayerGroup!);

        polygonLayer.bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:8px">
              ️ ${parcel.name}
            </div>
            <div style="font-size:13px;color:#374151;margin-bottom:4px">
               ${parcel.crop || '—'}
            </div>
            <div style="font-size:13px;color:#374151;margin-bottom:4px">
               ${parcel.area_ha || '—'} ha
            </div>
            <div style="font-size:13px;color:#374151;margin-bottom:10px">
               ${parcel.region || '—'}
            </div>
            <a href="/parcels/${parcel.id}"
               style="display:block;text-align:center;
                      background:#f0fdf4;color:#1a5c2e;
                      border:1px solid #bbf7d0;border-radius:8px;
                      padding:6px 12px;font-size:13px;font-weight:600;
                      text-decoration:none;">
               Diagnostiquer cette parcelle →
            </a>
          </div>
        `);

        allBounds.push(bounds);
        console.log('[MAP]  Parcelle ajoutée:', parcel.name);

      } catch (e) {
        console.error('[MAP]  Erreur:', parcel.name, e);
      }
    });

    if (allBounds.length > 0) {
      const combined = allBounds.reduce(
        (acc, b) => acc.extend(b),
        allBounds[0]
      );
      setTimeout(() => {
        this.map!.fitBounds(combined, { padding: [60, 60] });
        console.log('[MAP] FitBounds effectué');
      }, 200);
    }
  }

  // ── Data ──

  loadDashboard(): void {
    this.isLoading = true;

    this.reportsService.getDashboard().subscribe({
      next: (dashboard: any) => {
        this.summary     = dashboard.summary    || {};
        this.farmerName  = dashboard.farmer?.name        || this.farmerName;
        this.governorate = dashboard.farmer?.governorate || 'Tunis';

        this.parcelsService.getParcels().subscribe({
          next: (parcels: any) => {
            this.parcels = parcels || [];
            console.log('[DASHBOARD] Parcelles avec polygones:',
              this.parcels.map((p: any) => ({ name: p.name, hasPolygon: !!p.polygon_geojson }))
            );
            if (this.mapReady && this.parcelsLayerGroup) {
              this.displayParcelsOnMap();
            }
          },
          error: () => {}
        });

        forkJoin({
          weather:  this.weatherService.getCurrentWeather(this.governorate).pipe(catchError(() => of(null))),
          aiStatus: this.aiService.getAIStatus().pipe(catchError(() => of(null))),
          alerts:   this.alertsService.getAlerts().pipe(catchError(() => of([]))),
          market:   this.marketService.getPrices().pipe(catchError(() => of({}))),
          unread:   this.alertsService.getUnreadCount().pipe(catchError(() => of({ unread_count: 0 }))),
        }).subscribe({
          next: (results) => {
            this.weather      = results.weather  || null;
            this.aiStatus     = results.aiStatus || null;
            this.alerts       = (results.alerts  as any[]) || [];
            this.marketPrices = (results.market  as any)?.prices || results.market || {};
            this.unreadCount  = (results.unread  as any)?.unread_count || 0;
            this.isLoading    = false;
          },
          error: () => { this.isLoading = false; }
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ── Helpers ──

  setTab(tab: string): void { this.activeTab = tab; }

  getLegendColor(crop: string): string {
    return this.cropColors[crop] || '#2d8a4e';
  }

  getHealthColor(score: number): string {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getHealthLabel(score: number): string {
    if (score >= 70) return 'Bonne santé';
    if (score >= 40) return 'Attention';
    return 'Critique';
  }

  getTrendIcon(trend: string): string {
    if (trend === 'hausse') return '↑';
    if (trend === 'baisse') return '↓';
    return '→';
  }

  getTrendClass(trend: string): string {
    if (trend === 'hausse') return 'trend-up';
    if (trend === 'baisse') return 'trend-down';
    return 'trend-stable';
  }

  getModelStatus(key: string): boolean {
    return this.aiStatus?.models?.[key] || false;
  }

  get marketPricesArray(): any[] {
    return Object.entries(this.marketPrices || {}).map(
      ([crop, data]: [string, any]) => ({ crop, ...data })
    );
  }

  get recentAlerts(): any[] {
    return (this.alerts || []).slice(0, 5);
  }
}
