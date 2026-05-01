import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ParcelsService } from '../../../services/parcels.service';
import { AIService } from '../../../services/ai.service';

type DiagState = 'idle' | 'uploading' | 'analyzing' | 'cascading' | 'done' | 'error';

@Component({
  selector: 'app-parcel-detail',
  templateUrl: './parcel-detail.component.html',
  styleUrls: ['./parcel-detail.component.css']
})
export class ParcelDetailComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef;

  parcelId!: number;
  parcel: any = null;
  isLoading = true;
  error = '';

  diagState: DiagState = 'idle';
  photoPreview: string | null = null;
  photoBase64: string | null = null;

  diagResult: any  = null;
  yieldResult: any = null;
  irrigResult: any = null;

  showM2 = false;
  showM5 = false;

  savedToast = false;

  readonly analyzeMessages = [
    '🔬 Analyse de la texture des feuilles...',
    '🧠 Modèle EfficientNet-B0 en cours...',
    '🌿 Comparaison avec 38 classes de maladies...',
    '📊 Calcul du niveau de confiance...',
  ];
  currentMessage = '';
  private messageInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelsService: ParcelsService,
    private aiService: AIService,
  ) {}

  ngOnInit(): void {
    this.parcelId = +this.route.snapshot.paramMap.get('id')!;
    this.loadParcel();
  }

  ngOnDestroy(): void {
    this.stopMessageAnimation();
  }

  loadParcel(): void {
    this.parcelsService.getParcel(this.parcelId).subscribe({
      next: (data: any) => {
        this.parcel = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Parcelle introuvable.';
        this.isLoading = false;
      }
    });
  }

  // ── Upload ──

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner une image.';
      return;
    }

    this.diagState   = 'uploading';
    this.error       = '';
    this.diagResult  = null;
    this.yieldResult = null;
    this.irrigResult = null;
    this.showM2      = false;
    this.showM5      = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreview = e.target.result;
      this.photoBase64  = e.target.result.split(',')[1];
      this.startDiagnosis();
    };
    reader.readAsDataURL(file);
  }

  // ── Cascade M1 → M2 → M5 ──

  private startDiagnosis(): void {
    this.diagState = 'analyzing';
    this.startMessageAnimation();

    (this.aiService.predictDisease(this.photoBase64!, this.parcel?.crop) as Observable<any>)
      .subscribe({
        next: (result: any) => {
          this.stopMessageAnimation();
          this.diagResult = result;
          this.diagState  = 'cascading';

          if (!result.is_healthy) {
            this.triggerCascade();
          } else {
            this.diagState = 'done';
          }
        },
        error: () => {
          this.stopMessageAnimation();
          this.diagState = 'error';
          this.error = 'Erreur lors du diagnostic. Réessayez.';
        }
      });
  }

  private triggerCascade(): void {
    const yieldBody = {
      crop:        this.parcel?.crop    || 'Tomate',
      region:      this.parcel?.region  || 'Tunis',
      soil_type:   this.parcel?.soil_type || 'Argilo-calcaire',
      area_hectares: this.parcel?.area_ha || 1,
      temperature: 22,
      rainfall:    250,
    };

    (this.aiService.predictYield({ ...yieldBody, disease_occurred: 1 } as any) as Observable<any>)
      .subscribe({
        next: (withDisease: any) => {
          (this.aiService.predictYield({ ...yieldBody, disease_occurred: 0 } as any) as Observable<any>)
            .subscribe({
              next: (withoutDisease: any) => {
                const baseYield   = withoutDisease.yield_per_hectare || withoutDisease.predicted_yield_kg || 0;
                const sickYield   = withDisease.yield_per_hectare    || withDisease.predicted_yield_kg    || 0;
                const lossPct     = baseYield > 0
                  ? Math.round((1 - sickYield / baseYield) * 100)
                  : 0;
                this.yieldResult = {
                  with_disease:    withDisease,
                  without_disease: withoutDisease,
                  loss_pct:        lossPct,
                  loss_tnd:        Math.round(lossPct * (this.parcel?.area_ha || 1) * 80),
                };
                setTimeout(() => { this.showM2 = true; }, 300);
              },
              error: () => { this.showM2 = true; }
            });
        },
        error: () => { this.showM2 = true; }
      });

    (this.aiService.predictIrrigation({
      crop:                this.parcel?.crop     || 'Tomate',
      soil_type:           this.parcel?.soil_type || 'Argilo-calcaire',
      temperature:         28,
      humidity:            55,
      growth_stage:        'floraison',
      last_irrigation_days: 5,
    } as any) as Observable<any>).subscribe({
      next: (result: any) => {
        this.irrigResult = result;
        setTimeout(() => { this.showM5 = true; }, 800);
        setTimeout(() => { this.diagState = 'done'; }, 1200);
      },
      error: () => {
        this.showM5 = true;
        this.diagState = 'done';
      }
    });
  }

  // ── Animation ──

  private startMessageAnimation(): void {
    let i = 0;
    this.currentMessage = this.analyzeMessages[0];
    this.messageInterval = setInterval(() => {
      i = (i + 1) % this.analyzeMessages.length;
      this.currentMessage = this.analyzeMessages[i];
    }, 1200);
  }

  private stopMessageAnimation(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }

  // ── Historique ──

  saveDiagnosisToHistory(): void {
    if (!this.diagResult) return;

    const entry: any = {
      event_type:  'diagnosis',
      description: `Diagnostic IA: ${this.diagResult.disease} (${this.diagResult.confidence}% confiance). Traitement: ${this.diagResult.treatment || this.diagResult.recommendations_fr || '—'}`,
      data: {
        disease:    this.diagResult.disease,
        confidence: this.diagResult.confidence,
        crop:       this.parcel?.crop,
        season:     new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
      },
    };

    this.parcelsService.addParcelHistory(this.parcelId, entry).subscribe({
      next: () => { this.showSavedToast(); },
      error: () => {}
    });
  }

  showSavedToast(): void {
    this.savedToast = true;
    setTimeout(() => { this.savedToast = false; }, 3000);
  }

  // ── Reset ──

  resetDiagnosis(): void {
    this.diagState   = 'idle';
    this.photoPreview = null;
    this.photoBase64  = null;
    this.diagResult  = null;
    this.yieldResult = null;
    this.irrigResult = null;
    this.showM2      = false;
    this.showM5      = false;
    this.error       = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // ── Helpers ──

  getConfidenceColor(conf: number): string {
    if (conf >= 80) return '#10b981';
    if (conf >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getCropEmoji(crop: string): string {
    const map: Record<string, string> = {
      'Olivier': '🫒', 'Blé dur': '🌾', 'Tomate': '🍅',
      'Piment': '🌶️', 'Agrumes': '🍊', 'Orge': '🌿',
      'Grenade': '🍎', 'Fève': '🫘',
    };
    return map[crop] || '🌱';
  }

  goBack(): void {
    this.router.navigate(['/parcels']);
  }
}
