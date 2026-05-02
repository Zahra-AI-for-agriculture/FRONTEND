import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AlertsService } from '../../services/alerts.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit {

  farmerName   = localStorage.getItem('zahra_farmer_name') || 'Agriculteur';
  unreadAlerts = 0;
  sidebarOpen  = true;
  currentRoute = '';

  readonly navGroups: any[] = [
    {
      items: [
        { path: '/dashboard', icon: '🏠', labelFr: 'Tableau de bord', labelAr: 'لوحة القيادة' }
      ]
    },
    {
      groupLabelFr: 'Mon Exploitation',
      groupLabelAr: 'مزرعتي',
      items: [
        { path: '/parcels',    icon: '🗺️', labelFr: 'Mes Parcelles', labelAr: 'قطعي' },
        { path: '/irrigation', icon: '💧', labelFr: 'Irrigation',    labelAr: 'الري' },
        { path: '/treatments', icon: '💊', labelFr: 'Traitements',   labelAr: 'المعالجات' },
      ]
    },
    {
      groupLabelFr: 'Surveillance IA',
      groupLabelAr: 'مراقبة الذكاء الاصطناعي',
      items: [
        { path: '/ai/disease', icon: '🔬', labelFr: 'Diagnostic',    labelAr: 'التشخيص' },
        { path: '/ai/pest',    icon: '🐛', labelFr: 'Ravageurs',     labelAr: 'الآفات' },
        { path: '/ndvi',       icon: '🛰️', labelFr: 'NDVI',          labelAr: 'مؤشر NDVI' },
      ]
    },
    {
      groupLabelFr: 'Climat & Eau',
      groupLabelAr: 'المناخ والمياه',
      items: [
        { path: '/weather', icon: '🌤️', labelFr: 'Météo',      labelAr: 'الطقس' },
        { path: '/drought', icon: '☀️', labelFr: 'Sécheresse', labelAr: 'الجفاف' },
      ]
    },
    {
      groupLabelFr: 'Business',
      groupLabelAr: 'الأعمال',
      items: [
        { path: '/market',    icon: '📈', labelFr: 'Marché',        labelAr: 'السوق' },
        { path: '/reports',   icon: '📊', labelFr: 'Rapports',      labelAr: 'التقارير' },
        { path: '/knowledge', icon: '📚', labelFr: 'Connaissances', labelAr: 'المعرفة' },
      ]
    },
    {
      groupLabelFr: 'Communauté',
      groupLabelAr: 'المجتمع',
      items: [
        { path: '/community', icon: '👥', labelFr: 'Forum',   labelAr: 'المنتدى' },
        { path: '/alerts',    icon: '🔔', labelFr: 'Alertes', labelAr: 'التنبيهات',
          badge: true },
      ]
    },
  ];

  lang: 'fr' | 'ar' = 'fr';

  toggleLang(): void {
    this.lang = this.lang === 'fr' ? 'ar' : 'fr';
  }

  getLabel(item: any): string {
    return this.lang === 'fr' ? item.labelFr : item.labelAr;
  }

  getGroupLabel(group: any): string {
    if (!group.groupLabelFr) return '';
    return this.lang === 'fr' ? group.groupLabelFr : group.groupLabelAr;
  }

  constructor(
    private router: Router,
    private alertsService: AlertsService
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.url;
    });
    this.loadUnreadCount();
  }

  loadUnreadCount(): void {
    this.alertsService.getUnreadCount().subscribe({
      next:  (res) => this.unreadAlerts = (res as any).unread_count ?? (res as any).count ?? 0,
      error: ()    => this.unreadAlerts = 0,
    });
  }

  isActive(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
