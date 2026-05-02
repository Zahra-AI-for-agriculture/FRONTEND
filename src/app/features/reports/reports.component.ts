import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { ReportsService } from '../../services/reports.service';

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
}