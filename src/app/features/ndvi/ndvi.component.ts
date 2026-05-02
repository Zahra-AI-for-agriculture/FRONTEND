import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParcelsService } from '../../services/parcels.service';
import { AIService } from '../../services/ai.service';
// Assuming NdviService is created, mock import below if not
// import { NdviService } from '../../services/ndvi.service';

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
}