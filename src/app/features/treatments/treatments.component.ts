import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParcelsService } from '../../services/parcels.service';
// import { TreatmentsService } from '../../services/treatments.service';

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.css']
})
export class TreatmentsComponent implements OnInit {
  darReminders: any[] = [];
  treatmentLog: any[] = [];
  pesticides: any[] = [];
  parcels: any[] = [];
  selectedParcelId: number | null = null;
  isLoading = true;
  activeTab = 'reminders';
  showForm = false;

  form = {
    parcel_id: 0, product: '',
    dose: '', date_applied: new Date().toISOString().split('T')[0],
    disease_treated: '', dar_days: 14
  };

  treatmentsService = {
    getDARReminders: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getTreatmentLog: (id: any) => ({ subscribe: (cb: any) => cb.next([]) }),
    getPesticides: () => ({ subscribe: (cb: any) => cb.next({}) }),
    logTreatment: (data: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor(private parcelsService: ParcelsService) {}

  ngOnInit() {
    forkJoin({
      reminders:  this.treatmentsService.getDARReminders() as any,
      pesticides: this.treatmentsService.getPesticides() as any,
      parcels:    this.parcelsService.getParcels() as any,
    }).subscribe({
      next: (r: any) => {
        this.darReminders = r.reminders || [];
        this.pesticides   = r.pesticides || [];
        this.parcels      = r.parcels || [];
        if (this.parcels.length > 0) {
          this.selectedParcelId = this.parcels[0].id;
          this.form.parcel_id   = this.parcels[0].id;
          this.loadLog(this.parcels[0].id);
        } else {
          this.isLoading = false;
        }
      }
    });
  }

  loadLog(id: number) {
    this.isLoading = true;
    this.treatmentsService.getTreatmentLog(id).subscribe({
      next: (r: any) => { this.treatmentLog = r || []; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  logTreatment() {
    this.treatmentsService.logTreatment(this.form).subscribe({
      next: () => {
        this.showForm = false;
        this.loadLog(this.selectedParcelId!);
      }
    });
  }

  getDarStatus(days: number): string {
    if (days <= 0) return 'safe';
    if (days <= 3) return 'warning';
    return 'waiting';
  }
}