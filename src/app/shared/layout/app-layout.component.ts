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

  readonly navItems = [
    { path: '/dashboard',    icon: '🏠', label: 'Tableau de bord' },
    { path: '/parcels',      icon: '🗺️', label: 'Mes Parcelles'   },
    { path: '/ai/disease',   icon: '🔬', label: 'Diagnostic IA'   },
    { path: '/ai/irrigation',icon: '💧', label: 'Irrigation'      },
    { path: '/ai/drought',   icon: '☀️', label: 'Sécheresse'      },
    { path: '/ai/pest',      icon: '🐛', label: 'Ravageurs'       },
    { path: '/weather',      icon: '🌤️', label: 'Météo'           },
    { path: '/market',       icon: '📈', label: 'Marché'          },
    { path: '/alerts',       icon: '🔔', label: 'Alertes'         },
    { path: '/treatments',   icon: '💊', label: 'Traitements'     },
    { path: '/knowledge',    icon: '📚', label: 'Connaissances'   },
    { path: '/community',    icon: '👥', label: 'Communauté'      },
    { path: '/reports',      icon: '📊', label: 'Rapports'        },
  ];

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
