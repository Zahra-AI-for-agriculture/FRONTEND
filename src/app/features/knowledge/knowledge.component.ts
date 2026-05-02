import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { KnowledgeService } from '../../services/knowledge.service';

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
}