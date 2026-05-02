import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ParcelsService } from '../../services/parcels.service';
// import { MarketService } from '../../services/market.service';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css']
})
export class MarketComponent implements OnInit {
  prices: any[] = [];
  buyers: any[] = [];
  parcels: any[] = [];
  selectedParcel: any = null;
  sellAdvice: any = null;
  revenueForecast: any = null;
  isLoading = true;
  activeTab = 'prices';

  marketService = {
    getPrices: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getBuyers: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getSellAdvice: (id: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    getRevenueForecast: (id: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor(private parcelsService: ParcelsService) {}

  ngOnInit() {
    forkJoin({
      prices:  this.marketService.getPrices() as any,
      buyers:  this.marketService.getBuyers() as any,
      parcels: this.parcelsService.getParcels() as any,
    }).subscribe({
      next: (r: any) => {
        const pricesObj = r.prices?.prices || {};
        this.prices  = Object.entries(pricesObj).map(
          ([crop, data]: [string, any]) => ({ crop, ...data })
        );
        this.buyers  = r.buyers?.buyers || [];
        this.parcels = r.parcels || [];
        if (this.parcels.length > 0) {
          this.loadParcelAdvice(this.parcels[0]);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadParcelAdvice(p: any) {
    this.selectedParcel = p;
    forkJoin({
      advice:  this.marketService.getSellAdvice(p.id) as any,
      revenue: this.marketService.getRevenueForecast(p.id) as any,
    }).subscribe({
      next: (r: any) => {
        this.sellAdvice      = r.advice;
        this.revenueForecast = r.revenue;
      }
    });
  }

  getTrendIcon(trend: string): string {
    if (trend === 'hausse') return '';
    if (trend === 'baisse') return '';
    return '';
  }

  getTrendClass(trend: string): string {
    if (trend === 'hausse') return 'trend-up';
    if (trend === 'baisse') return 'trend-down';
    return 'trend-stable';
  }
}