import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlertsService } from '../../services/alerts.service';

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
}