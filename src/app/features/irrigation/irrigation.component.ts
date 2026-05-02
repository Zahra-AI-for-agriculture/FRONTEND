import { Component, OnInit } from '@angular/core';
import { AIService } from '../../services/ai.service';
import { ParcelsService } from '../../services/parcels.service';

@Component({
  selector: 'app-irrigation',
  templateUrl: './irrigation.component.html',
  styleUrls: ['./irrigation.component.css']
})
export class IrrigationComponent implements OnInit {
  parcels: any[] = [];
  selectedParcelId: number | null = null;
  weeklyPlan: any = null;
  isLoading = false;

  form = {
    crop: '', soil_type: 'Argilo-calcaire',
    temperature: 25, humidity: 55,
    rainfall_last_7d: 5, growth_stage: 'floraison'
  };
  irrigResult: any = null;
  calcLoading = false;

  readonly growthStages = [
    'semis', 'levée', 'tallage', 'floraison', 'grain', 'maturité'
  ];

  constructor(private aiService: AIService, private parcelsService: ParcelsService) {}

  ngOnInit() {
    this.parcelsService.getParcels().subscribe({
      next: (p) => {
        this.parcels = p || [];
        if (this.parcels.length > 0) {
          this.selectParcel(this.parcels[0].id);
        }
      }
    });
  }

  selectParcel(id: number) {
    this.selectedParcelId = id;
    this.isLoading = true;
    const parcel = this.parcels.find(p => p.id === id);
    if (parcel) this.form.crop = parcel.crop;
    this.aiService.getWeeklyIrrigationPlan(id).subscribe({
      next: (plan) => { this.weeklyPlan = plan; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  calculate() {
    this.calcLoading = true;
    this.aiService.predictIrrigation({
      ...this.form,
      temperature: +this.form.temperature,
      humidity: +this.form.humidity,
      rainfall_last_7d: +this.form.rainfall_last_7d,
    }).subscribe({
      next: (r) => { this.irrigResult = r; this.calcLoading = false; },
      error: () => { this.calcLoading = false; }
    });
  }
}