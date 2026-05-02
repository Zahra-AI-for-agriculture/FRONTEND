import { Component, OnInit } from '@angular/core';
import { ParcelsService } from '../../services/parcels.service';
import { AIService } from '../../services/ai.service';

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
    this.aiService.predictPestRisk(({
      ...this.form,
      temperature: +this.form.temperature,
      humidity: +this.form.humidity,
      month: +this.form.month,
      rainfall_last_30d: +this.form.rainfall_last_30d,
    } as any)).subscribe({
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
}