import { Component, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ParcelsService } from '../../../services/parcels.service';
import { AIService } from '../../../services/ai.service';
import * as L from 'leaflet';

// Fix icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl:       'assets/marker-icon.png',
  shadowUrl:     'assets/marker-shadow.png',
});

interface ParcelDraft {
  name: string; lat: number; lng: number;
  area_ha: number; polygon_geojson: string; crop: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy, AfterViewChecked {

  currentStep  = 1;
  isLoading    = false;
  errorMessage = '';
  showPassword = false;

  // Map state
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private parcelLayer: L.GeoJSON | null = null;
  private vertexMarkers: L.Marker[] = [];
  private editableCoords: number[][] = [];
  isEditing = false;
  mapInitialized      = false;
  mapNeedsInit        = false;
  segmentationLoading = false;
  segmentationDone    = false;
  segmentationError   = '';

  // Multi-parcel state
  parcels: ParcelDraft[] = [];
  showAddAnotherDialog = false;
  parcelSaved = false;

  formData = {
    name:                '',
    phone:               '',
    password:            '',
    confirmPassword:     '',
    language_preference: 'fr',
    governorate:         '',
    region_zone:         '',
    main_crop:           '',
    parcel_lat:          null as number | null,
    parcel_lng:          null as number | null,
    parcel_name:         '',
    parcel_area_ha:      null as number | null,
    polygon_geojson:     '',
  };

  readonly zones = [
    { zone: 'nord_humide',      label: 'Nord Humide',
      emoji: '🌲', gouvernorats: 'Béja, Jendouba, Bizerte',
      gouvernorat: 'Béja',     cultures: ['Céréales', 'Maraîchage'],
      lat: 36.73, lng: 9.18,  zoom: 13 },
    { zone: 'nord_semi_aride',  label: 'Nord Semi-Aride',
      emoji: '🌾', gouvernorats: 'Siliana, Le Kef',
      gouvernorat: 'Siliana',  cultures: ['Blé dur', 'Olivier'],
      lat: 36.08, lng: 9.37,  zoom: 13 },
    { zone: 'cap_bon',          label: 'Cap Bon',
      emoji: '🍊', gouvernorats: 'Nabeul',
      gouvernorat: 'Nabeul',   cultures: ['Agrumes', 'Tomate'],
      lat: 36.45, lng: 10.73, zoom: 13 },
    { zone: 'centre_est',       label: 'Centre Est',
      emoji: '🫒', gouvernorats: 'Sousse, Monastir',
      gouvernorat: 'Sousse',   cultures: ['Olivier', 'Amandier'],
      lat: 35.82, lng: 10.64, zoom: 13 },
    { zone: 'centre_ouest',     label: 'Centre Ouest',
      emoji: '🌵', gouvernorats: 'Kasserine, Sidi Bouzid',
      gouvernorat: 'Sidi Bouzid', cultures: ['Blé', 'Piment'],
      lat: 35.04, lng: 9.49,  zoom: 13 },
    { zone: 'sud_est',          label: 'Sud Est',
      emoji: '☀️', gouvernorats: 'Sfax, Gabès',
      gouvernorat: 'Sfax',     cultures: ['Olivier', 'Dattes'],
      lat: 34.74, lng: 10.76, zoom: 13 },
    { zone: 'sud_ouest',        label: 'Sud Ouest',
      emoji: '🌴', gouvernorats: 'Gafsa, Tozeur',
      gouvernorat: 'Tozeur',   cultures: ['Dattes', 'Primeurs'],
      lat: 33.92, lng: 8.13,  zoom: 13 },
    { zone: 'tunisie_centrale', label: 'Tunisie Centrale',
      emoji: '🏜️', gouvernorats: 'Kairouan, Zaghouan',
      gouvernorat: 'Kairouan', cultures: ['Céréales', 'Maraîchage'],
      lat: 35.68, lng: 10.10, zoom: 13 },
  ];

  readonly cultures = [
    { value: 'Olivier',  emoji: '🫒' },
    { value: 'Blé dur',  emoji: '🌾' },
    { value: 'Tomate',   emoji: '🍅' },
    { value: 'Piment',   emoji: '🌶️' },
    { value: 'Agrumes',  emoji: '🍊' },
    { value: 'Orge',     emoji: '🌿' },
    { value: 'Grenade',  emoji: '🍎' },
    { value: 'Fève',     emoji: '🫘' },
  ];

  private selectedZone: any = null;
  private readonly SAM_ZOOM = 17;

  constructor(
    private authService:    AuthService,
    private parcelsService: ParcelsService,
    private aiService:      AIService,
    private router:         Router
  ) {}

  // ── Validation ──

  get isStep1Valid(): boolean {
    return this.formData.name.trim().length >= 2
      && this.formData.phone.trim().length >= 8
      && this.formData.password.length >= 6
      && this.formData.password === this.formData.confirmPassword;
  }

  get isStep2Valid(): boolean {
    return this.formData.region_zone !== ''
      && this.formData.main_crop !== '';
  }

  get isStep3Valid(): boolean {
    return this.parcels.length > 0;
  }

  // ── Navigation ──

  nextStep(): void {
    if (this.currentStep === 1 && !this.isStep1Valid) {
      this.errorMessage = 'Veuillez corriger les erreurs.'; return;
    }
    if (this.currentStep === 2 && !this.isStep2Valid) {
      this.errorMessage = 'Sélectionnez votre région et culture.'; return;
    }
    this.errorMessage = '';
    this.currentStep++;
    if (this.currentStep === 3) this.mapNeedsInit = true;
  }

  prevStep(): void {
    this.errorMessage = '';
    this.currentStep--;
    if (this.currentStep !== 3) this.destroyMap();
  }

  selectZone(zone: any): void {
    this.selectedZone         = zone;
    this.formData.region_zone = zone.zone;
    this.formData.governorate = zone.gouvernorat;
    if (!this.formData.main_crop && zone.cultures.length > 0) {
      this.formData.main_crop = zone.cultures[0];
    }
  }

  isZoneSelected(zone: any): boolean {
    return this.formData.region_zone === zone.zone;
  }

  selectCulture(value: string): void { this.formData.main_crop = value; }
  isCultureSelected(value: string): boolean {
    return this.formData.main_crop === value;
  }
  togglePassword(): void { this.showPassword = !this.showPassword; }

  // ── Lifecycle map ──

  ngAfterViewChecked(): void {
    if (this.mapNeedsInit && this.currentStep === 3 && !this.mapInitialized) {
      const el = document.getElementById('parcel-map');
      if (el) {
        this.mapNeedsInit = false;
        setTimeout(() => this.initMap(), 50);
      }
    }
  }

  // ── Initialisation carte ──

  private initMap(): void {
    if (this.mapInitialized || !this.selectedZone) return;

    this.map = L.map('parcel-map', {
      center: [this.selectedZone.lat, this.selectedZone.lng],
      zoom:   this.selectedZone.zoom,
    });

    // Google satellite tiles — full resolution up to zoom 20
    L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        attribution:    '© Google Maps',
        subdomains:     ['0', '1', '2', '3'],
        maxZoom:        21,
        maxNativeZoom:  20,
      } as any
    ).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.isEditing) this.onMapClick(e.latlng.lat, e.latlng.lng);
    });

    this.mapInitialized = true;
  }

  // ── Clic sur la map ──

  private onMapClick(lat: number, lng: number): void {
    if (this.marker) this.map!.removeLayer(this.marker);
    this.marker = L.marker([lat, lng])
      .addTo(this.map!)
      .bindPopup('📍 Ma parcelle')
      .openPopup();

    this.formData.parcel_lat = lat;
    this.formData.parcel_lng = lng;

    if (this.parcelLayer) {
      this.map!.removeLayer(this.parcelLayer);
      this.parcelLayer = null;
    }

    this.segmentationLoading = true;
    this.segmentationDone    = false;
    this.segmentationError   = '';
    this.parcelSaved         = false;

    this.map!.setView([lat, lng], this.SAM_ZOOM, { animate: false });

    setTimeout(() => {
      this.captureAndSegment(lat, lng);
    }, 1500);
  }

  // ── Capturer la tuile Google satellite + appeler M4 ──

  private async captureAndSegment(lat: number, lng: number): Promise<void> {
    try {
      const tileCoords = this.latLngToTile(lat, lng, this.SAM_ZOOM);

      const s = Math.floor(Math.random() * 4);
      const tileUrl = `https://mt${s}.google.com/vt/lyrs=s&x=${tileCoords.x}&y=${tileCoords.y}&z=${this.SAM_ZOOM}`;

      const response = await fetch(tileUrl);
      if (!response.ok) throw new Error(`Tuile Google erreur ${response.status}`);
      const blob = await response.blob();

      const imageBase64  = await this.blobToBase64(blob);
      const clickInTile  = this.getClickPositionInTile(lat, lng, this.SAM_ZOOM);

      console.log('[M4] Tuile:', tileCoords);
      console.log('[M4] Clic dans tuile:', clickInTile);

      this.callM4(imageBase64, clickInTile.x, clickInTile.y, tileCoords);

    } catch (err: any) {
      console.error('[M4] Erreur capture:', err);
      this.segmentationLoading = false;
      this.segmentationError   = 'Erreur capture satellite';
      this.drawApproximatePolygon(lat, lng);
    }
  }

  // ── Conversion lat/lng → coordonnées de tuile ──

  private latLngToTile(lat: number, lng: number, zoom: number): { x: number, y: number } {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor(
      (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)
      / 2 * n
    );
    return { x, y };
  }

  // ── Position exacte du clic dans la tuile (0-256px) ──

  private getClickPositionInTile(lat: number, lng: number, zoom: number): { x: number, y: number } {
    const n          = Math.pow(2, zoom);
    const tileCoords = this.latLngToTile(lat, lng, zoom);

    const xFloat = (lng + 180) / 360 * n;
    const latRad  = lat * Math.PI / 180;
    const yFloat  = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;

    const x = Math.round((xFloat - tileCoords.x) * 256);
    const y = Math.round((yFloat - tileCoords.y) * 256);

    return {
      x: Math.max(1, Math.min(x, 255)),
      y: Math.max(1, Math.min(y, 255)),
    };
  }

  // ── Blob → base64 ──

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ── Appeler le modèle M4 SAM ──

  private callM4(
    imageBase64: string,
    clickX: number,
    clickY: number,
    tileCoords: { x: number, y: number }
  ): void {
    this.aiService.segmentParcel(imageBase64, clickX, clickY).subscribe({
      next: (result) => {
        this.segmentationLoading = false;

        if (result.polygon_geojson) {
          try {
            const geoJson = typeof result.polygon_geojson === 'string'
              ? JSON.parse(result.polygon_geojson)
              : result.polygon_geojson;

            const geoJsonLatLng = this.pixelPolygonToLatLng(geoJson, tileCoords, this.SAM_ZOOM);

            this.parcelLayer = L.geoJSON(geoJsonLatLng as any, {
              style: {
                color:       '#00ff88',
                weight:      3,
                opacity:     1.0,
                fillColor:   '#00ff88',
                fillOpacity: 0.25,
              }
            }).addTo(this.map!);

            const bounds = this.parcelLayer.getBounds();
            this.map!.fitBounds(bounds, { padding: [40, 40] });

            const areaHa = this.calculateAreaHa(bounds);
            this.formData.parcel_area_ha  = areaHa;
            this.formData.polygon_geojson = JSON.stringify(geoJsonLatLng);
            this.segmentationDone = true;

            console.log('[M4] ✅ Polygone affiché, superficie:', areaHa, 'ha');

          } catch (e) {
            console.warn('[M4] Erreur conversion GeoJSON:', e);
            this.segmentationError = 'Polygone IA invalide — approximation utilisée';
            this.drawApproximatePolygon(this.formData.parcel_lat!, this.formData.parcel_lng!);
          }
        } else {
          this.segmentationError = 'SAM n\'a pas détecté de parcelle';
          this.drawApproximatePolygon(this.formData.parcel_lat!, this.formData.parcel_lng!);
        }
      },
      error: (err) => {
        console.error('[M4] Erreur API:', err);
        this.segmentationLoading = false;
        this.segmentationError   = 'Modèle M4 indisponible — approximation utilisée';
        this.drawApproximatePolygon(this.formData.parcel_lat!, this.formData.parcel_lng!);
      }
    });
  }

  // ── Convertir polygone pixel → LatLng géographique ──

  private pixelPolygonToLatLng(
    geoJson: any,
    tileCoords: { x: number, y: number },
    zoom: number
  ): any {
    if (geoJson.type !== 'Polygon' || !geoJson.coordinates?.[0]) {
      return geoJson;
    }

    const n        = Math.pow(2, zoom);
    const tileSize = 256;

    const newCoords = geoJson.coordinates[0].map((pt: number[]) => {
      const globalX = tileCoords.x + pt[0] / tileSize;
      const globalY = tileCoords.y + pt[1] / tileSize;

      const lng    = globalX / n * 360 - 180;
      const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * globalY / n)));
      const lat    = latRad * 180 / Math.PI;

      return [lng, lat];
    });

    return { type: 'Polygon', coordinates: [newCoords] };
  }

  // ── Calculer superficie en hectares ──

  private calculateAreaHa(bounds: L.LatLngBounds): number {
    const lat1 = bounds.getSouth() * Math.PI / 180;
    const lat2 = bounds.getNorth() * Math.PI / 180;
    const lng1 = bounds.getWest()  * Math.PI / 180;
    const lng2 = bounds.getEast()  * Math.PI / 180;

    const R      = 6371000;
    const areaM2 = R * R
      * Math.abs(lat2 - lat1)
      * Math.abs(lng2 - lng1)
      * Math.cos((lat1 + lat2) / 2);

    return Math.round(areaM2 / 10000 * 100) / 100;
  }

  // ── Polygone approximatif (fallback si M4 échoue) ──

  private drawApproximatePolygon(lat: number, lng: number): void {
    const delta     = 0.002;
    const geoJsonGeom = {
      type: 'Polygon' as const,
      coordinates: [[
        [lng - delta, lat - delta],
        [lng + delta, lat - delta],
        [lng + delta, lat + delta],
        [lng - delta, lat + delta],
        [lng - delta, lat - delta],
      ]]
    };

    if (this.parcelLayer) this.map!.removeLayer(this.parcelLayer);

    this.parcelLayer = L.geoJSON(
      { type: 'Feature', geometry: geoJsonGeom, properties: {} } as any,
      {
        style: {
          color: '#ffaa00', weight: 3,
          opacity: 0.9, fillColor: '#ffaa00', fillOpacity: 0.2
        }
      }
    ).addTo(this.map!);

    this.formData.parcel_area_ha  = 4.0;
    this.formData.polygon_geojson = JSON.stringify(geoJsonGeom);
    this.segmentationDone         = true;
  }

  // ── Edition native par vertex markers (sans leaflet-draw) ──

  private clearVertexMarkers(): void {
    if (this.map) {
      this.vertexMarkers.forEach(m => this.map!.removeLayer(m));
    }
    this.vertexMarkers = [];
  }

  enableEditing(): void {
    if (!this.parcelLayer || !this.map) return;
    this.isEditing      = true;
    this.editableCoords = [];

    this.parcelLayer.eachLayer((layer: any) => {
      if (layer.getLatLngs) {
        const latlngs: L.LatLng[] = layer.getLatLngs()[0] as L.LatLng[];
        this.editableCoords = latlngs.map(ll => [ll.lat, ll.lng]);
      }
    });

    this.clearVertexMarkers();
    this.editableCoords.forEach((coord, i) => {
      const marker = L.marker([coord[0], coord[1]], {
        draggable: true,
        icon: L.divIcon({
          className: '',
          html: '<div style="width:12px;height:12px;background:white;border:2px solid #2d8a4e;border-radius:50%;cursor:grab"></div>',
          iconSize:   [12, 12],
          iconAnchor: [6, 6],
        }),
      });
      marker.on('drag', (e: any) => {
        const pos = e.target.getLatLng();
        this.editableCoords[i] = [pos.lat, pos.lng];
        this.updatePolygonFromCoords();
      });
      marker.addTo(this.map!);
      this.vertexMarkers.push(marker);
    });
  }

  private updatePolygonFromCoords(): void {
    if (!this.parcelLayer || !this.map) return;
    const latlngs = this.editableCoords.map(c => L.latLng(c[0], c[1]));
    this.parcelLayer.eachLayer((layer: any) => {
      if (layer.setLatLngs) layer.setLatLngs([latlngs]);
    });
  }

  confirmEditing(): void {
    this.clearVertexMarkers();
    this.isEditing = false;

    if (this.editableCoords.length > 0) {
      const closed  = [...this.editableCoords, this.editableCoords[0]];
      const geoJson = {
        type: 'Polygon',
        coordinates: [closed.map(c => [c[1], c[0]])],
      };
      this.formData.polygon_geojson = JSON.stringify(geoJson);

      if (this.parcelLayer) {
        this.formData.parcel_area_ha = this.calculateAreaHa(
          this.parcelLayer.getBounds()
        );
      }
    }
  }

  cancelEditing(): void {
    this.clearVertexMarkers();
    this.isEditing = false;

    if (this.formData.polygon_geojson && this.map) {
      if (this.parcelLayer) this.map.removeLayer(this.parcelLayer);
      try {
        const geoJson    = JSON.parse(this.formData.polygon_geojson);
        this.parcelLayer = L.geoJSON(geoJson as any, {
          style: { color: '#00ff88', weight: 3, opacity: 1.0, fillColor: '#00ff88', fillOpacity: 0.25 }
        }).addTo(this.map);
      } catch (_) { /* keep current state */ }
    }
  }

  // ── Multi-parcel flow ──

  validateCurrentParcel(): void {
    if (!this.formData.parcel_lat || !this.formData.parcel_lng) return;
    const draft: ParcelDraft = {
      name:            this.formData.parcel_name || `Parcelle ${this.parcels.length + 1}`,
      lat:             this.formData.parcel_lat!,
      lng:             this.formData.parcel_lng!,
      area_ha:         this.formData.parcel_area_ha || 0,
      polygon_geojson: this.formData.polygon_geojson,
      crop:            this.formData.main_crop,
    };
    this.parcels.push(draft);
    this.parcelSaved          = true;
    this.showAddAnotherDialog = true;
  }

  addAnotherParcel(): void {
    this.showAddAnotherDialog = false;
    this.parcelSaved          = false;

    this.formData.parcel_lat      = null;
    this.formData.parcel_lng      = null;
    this.formData.parcel_name     = '';
    this.formData.parcel_area_ha  = null;
    this.formData.polygon_geojson = '';
    this.segmentationDone         = false;
    this.segmentationError        = '';

    if (this.marker)      { this.map!.removeLayer(this.marker);     this.marker      = null; }
    if (this.parcelLayer) { this.map!.removeLayer(this.parcelLayer); this.parcelLayer = null; }
    this.clearVertexMarkers();
    this.isEditing = false;
  }

  finishParcelSelection(): void {
    this.showAddAnotherDialog = false;
  }

  get lastParcel(): ParcelDraft | null {
    return this.parcels.length > 0 ? this.parcels[this.parcels.length - 1] : null;
  }

  // ── Cleanup ──

  private destroyMap(): void {
    this.clearVertexMarkers();
    this.isEditing = false;
    if (this.map) { this.map.remove(); this.map = null; }
    this.mapInitialized      = false;
    this.segmentationDone    = false;
    this.segmentationLoading = false;
    this.segmentationError   = '';
  }

  ngOnDestroy(): void { this.destroyMap(); }

  // ── Soumission finale ──

  onSubmit(): void {
    if (this.parcels.length === 0) {
      this.errorMessage = 'Validez au moins une parcelle avant de continuer.';
      return;
    }
    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.register({
      phone:               this.formData.phone.trim(),
      password:            this.formData.password,
      name:                this.formData.name.trim(),
      governorate:         this.formData.governorate,
      main_crop:           this.formData.main_crop,
      language_preference: this.formData.language_preference,
    }).subscribe({
      next:  () => this.createAllParcels(0),
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.detail || 'Erreur création du compte.';
      }
    });
  }

  private createAllParcels(index: number): void {
    if (index >= this.parcels.length) {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
      return;
    }
    const p    = this.parcels[index];
    const body = {
      name:            p.name,
      crop:            p.crop,
      region:          this.formData.governorate,
      area_ha:         p.area_ha,
      polygon_geojson: p.polygon_geojson,
    };
    this.parcelsService.createParcel(body).subscribe({
      next:  () => this.createAllParcels(index + 1),
      error: () => this.createAllParcels(index + 1),
    });
  }
}
