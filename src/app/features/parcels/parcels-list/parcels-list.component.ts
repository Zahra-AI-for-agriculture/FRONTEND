import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParcelsService } from '../../../services/parcels.service';

@Component({
  selector: 'app-parcels-list',
  templateUrl: './parcels-list.component.html',
  styleUrls: ['./parcels-list.component.css']
})
export class ParcelsListComponent implements OnInit {
  parcels: any[] = [];
  isLoading = true;
  error = '';

  constructor(
    private parcelsService: ParcelsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.parcelsService.getParcels().subscribe({
      next: (data) => {
        this.parcels = (data as any[]) || [];
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les parcelles.';
        this.isLoading = false;
      }
    });
  }

  goToParcel(id: number): void {
    this.router.navigate(['/parcels', id]);
  }

  getHealthColor(score: number | null): string {
    if (!score) return '#9ca3af';
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getHealthLabel(score: number | null): string {
    if (!score) return 'Non évalué';
    if (score >= 70) return 'Bonne santé';
    if (score >= 40) return 'Attention';
    return 'Critique';
  }

  getCropEmoji(crop: string): string {
    const map: Record<string, string> = {
      'Olivier': '🫒', 'Blé dur': '🌾', 'Tomate': '🍅',
      'Piment': '🌶️', 'Agrumes': '🍊', 'Orge': '🌿',
      'Grenade': '🍎', 'Fève': '🫘',
    };
    return map[crop] || '🌱';
  }
}
