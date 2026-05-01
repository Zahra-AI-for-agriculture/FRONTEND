import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ParcelsService } from '../../../services/parcels.service';
import { AIService } from '../../../services/ai.service';
import { AuthService } from '../../../services/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-parcels-list',
  templateUrl: './parcels-list.component.html',
  styleUrls: ['./parcels-list.component.css']
})
export class ParcelsListComponent implements OnInit, OnDestroy {
  parcels: any[] = [];
  isLoading = true;
  error = '';

  // ADD PARCEL MODAL STATE
  showAddModal = false;
  isCreating = false;
  
  newParcelData = {
    name: '',
    region_zone: '',
    governorate: '',
    main_crop: '',
    parcel_lat: null as number | null,
    parcel_lng: null as number | null,
    parcel_area_ha: null as number | null,
    polygon_geojson: ''
  };

  zones = [
    { zone: 'nord_humide',      label: 'Nord Humide',      gouvernorat: 'Béja', lat: 36.73, lng: 9.18,  zoom: 13 },
    { zone: 'nord_semi_aride',  label: 'Nord Semi-Aride',  gouvernorat: 'Siliana', lat: 36.08, lng: 9.37,  zoom: 13 },
    { zone: 'cap_bon',          label: 'Cap Bon',          gouvernorat: 'Nabeul', lat: 36.45, lng: 10.73, zoom: 13 },
    { zone: 'centre_est',       label: 'Centre Est',       gouvernorat: 'Sousse', lat: 35.82, lng: 10.64, zoom: 13 },
    { zone: 'centre_ouest',     label: 'Centre Ouest',     gouvernorat: 'Sidi Bouzid', lat: 35.04, lng: 9.49,  zoom: 13 },
    { zone: 'sud_est',          label: 'Sud Est',          gouvernorat: 'Sfax', lat: 34.74, lng: 10.76, zoom: 13 },
    { zone: 'sud_ouest',        label: 'Sud Ouest',        gouvernorat: 'Tozeur', lat: 33.92, lng: 8.13,  zoom: 13 },
    { zone: 'tunisie_centrale', label: 'Tunisie Centrale', gouvernorat: 'Kairouan', lat: 35.68, lng: 10.10, zoom: 13 },
  ];

  cultures = [
    { value: 'Olivier',  label: 'Olivier' },
    { value: 'Blé dur',  label: 'Blé dur' },
    { value: 'Tomate',   label: 'Tomate' },
    { value: 'Piment',   label: 'Piment' },
    { value: 'Agrumes',  label: 'Agrumes' },
    { value: 'Orge',     label: 'Orge' },
    { value: 'Grenade',  label: 'Grenade' },
    { value: 'Fève',     label: 'Fève' },
  ];

  selectedZone: any = null;

  // MAP STATE
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  parcelLayer: L.GeoJSON | null = null;
  private vertexMarkers: L.Marker[] = [];
  private editableCoords: number[][] = [];
  
  isEditing = false;
  segmentationLoading = false;
  segmentationDone = false;
  segmentationError = '';
  private readonly SAM_ZOOM = 17;

  constructor(
    private parcelsService: ParcelsService,
    private aiService: AIService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParcels();
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  loadParcels(): void {
    this.isLoading = true;
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

  // --- UI NAVIGATION ---
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
      'Piment': '🌶️', 'Agrumes': '🍊', 'Orge': '🌾',
      'Grenade': '🍎', 'Fève': '🫘',
    };
    return map[crop] || '🌿';
  }

  // --- MODAL & FORM LOGIC ---
  openAddModal(): void {
    this.showAddModal = true;
    this.resetForm();
    // Default to user's governorate if known
    const userGov = this.authService.getStoredGovernorate();
    const match = this.zones.find(z => z.gouvernorat === userGov);
    if (match) this.selectZone(match);

    setTimeout(() => this.initMap(), 100);
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.destroyMap();
  }

  resetForm(): void {
    this.newParcelData = {
      name: '', region_zone: '', governorate: '', main_crop: '',
      parcel_lat: null, parcel_lng: null, parcel_area_ha: null, polygon_geojson: ''
    };
    this.selectedZone = null;
    this.segmentationDone = false;
    this.segmentationError = '';
    this.segmentationLoading = false;
    this.isEditing = false;
    this.isCreating = false;
  }

  selectZone(z: any): void {
    this.selectedZone = z;
    this.newParcelData.region_zone = z.zone;
    this.newParcelData.governorate = z.gouvernorat;
    if (this.map) {
      this.map.setView([z.lat, z.lng], z.zoom);
    }
  }

  selectCulture(val: string): void {
    this.newParcelData.main_crop = val;
  }

  get isFormValid(): boolean {
    return !!(this.newParcelData.region_zone && 
              this.newParcelData.main_crop && 
              this.newParcelData.parcel_lat && 
              this.newParcelData.parcel_lng && 
              this.newParcelData.polygon_geojson);
  }

  // --- MAP & M4 LOGIC ---
  private initMap(): void {
    if (this.map) {
      this.map.invalidateSize();
      return;
    }
    const center: L.LatLngTuple = this.selectedZone ? [this.selectedZone.lat, this.selectedZone.lng] : [35.04, 9.49];
    const zoom = this.selectedZone ? this.selectedZone.zoom : 7;

    this.map = L.map('add-parcel-map', { center, zoom });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '© Google Maps',
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 21,
      maxNativeZoom: 20
    } as any).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.isEditing) this.onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Timeout ensures the container has its final dimensions before recalculating Leaflet's grid.
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 200);
  }

  private destroyMap(): void {
    this.clearVertexMarkers();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private onMapClick(lat: number, lng: number): void {
    if (this.marker) this.map!.removeLayer(this.marker);
    this.marker = L.marker([lat, lng]).addTo(this.map!);
    this.newParcelData.parcel_lat = lat;
    this.newParcelData.parcel_lng = lng;

    if (this.parcelLayer) {
      this.map!.removeLayer(this.parcelLayer);
      this.parcelLayer = null;
    }

    this.segmentationLoading = true;
    this.segmentationDone = false;
    this.segmentationError = '';

    this.map!.setView([lat, lng], this.SAM_ZOOM, { animate: false });
    setTimeout(() => this.captureAndSegment(lat, lng), 1500);
  }

  private async captureAndSegment(lat: number, lng: number): Promise<void> {
    try {
      const tileCoords = this.latLngToTile(lat, lng, this.SAM_ZOOM);
      const s = Math.floor(Math.random() * 4);
      const tileUrl = `https://mt${s}.google.com/vt/lyrs=s&x=${tileCoords.x}&y=${tileCoords.y}&z=${this.SAM_ZOOM}`;
      const response = await fetch(tileUrl);
      if (!response.ok) throw new Error('Erreur tuile Google');
      
      const blob = await response.blob();
      const imageBase64 = await this.blobToBase64(blob);
      const clickInTile = this.getClickPositionInTile(lat, lng, this.SAM_ZOOM);

      this.callM4(imageBase64, clickInTile.x, clickInTile.y, tileCoords);
    } catch (err: any) {
      console.error(err);
      this.segmentationLoading = false;
      this.segmentationError = 'Erreur capture satellite';
      this.drawApproximatePolygon(lat, lng);
    }
  }

  private callM4(imageBase64: string, clickX: number, clickY: number, tileCoords: { x: number, y: number }): void {
    this.aiService.segmentParcel(imageBase64, clickX, clickY).subscribe({
      next: (result) => {
        this.segmentationLoading = false;
        if (result.polygon_geojson) {
          try {
            const geoJson = typeof result.polygon_geojson === 'string' ? JSON.parse(result.polygon_geojson) : result.polygon_geojson;
            const geoJsonLatLng = this.pixelPolygonToLatLng(geoJson, tileCoords, this.SAM_ZOOM);
            this.parcelLayer = L.geoJSON(geoJsonLatLng as any, {
              style: { color: '#00ff88', weight: 3, opacity: 1.0, fillColor: '#00ff88', fillOpacity: 0.25 }
            }).addTo(this.map!);
            const bounds = this.parcelLayer.getBounds();
            this.map!.fitBounds(bounds, { padding: [40, 40] });
            this.newParcelData.parcel_area_ha = this.calculateAreaHa(bounds);
            this.newParcelData.polygon_geojson = JSON.stringify(geoJsonLatLng);
            this.segmentationDone = true;
          } catch (e) {
            this.segmentationError = 'Polygone IA invalide';
            this.drawApproximatePolygon(this.newParcelData.parcel_lat!, this.newParcelData.parcel_lng!);
          }
        } else {
          this.segmentationError = 'SAM n\'a pas détecté de parcelle';
          this.drawApproximatePolygon(this.newParcelData.parcel_lat!, this.newParcelData.parcel_lng!);
        }
      },
      error: () => {
        this.segmentationLoading = false;
        this.segmentationError = 'Modèle M4 indisponible';
        this.drawApproximatePolygon(this.newParcelData.parcel_lat!, this.newParcelData.parcel_lng!);
      }
    });
  }

  // --- MATH UTILS ---
  private latLngToTile(lat: number, lng: number, zoom: number): { x: number, y: number } {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y };
  }

  private getClickPositionInTile(lat: number, lng: number, zoom: number): { x: number, y: number } {
    const n = Math.pow(2, zoom);
    const tileCoords = this.latLngToTile(lat, lng, zoom);
    const xFloat = (lng + 180) / 360 * n;
    const latRad = lat * Math.PI / 180;
    const yFloat = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
    const x = Math.round((xFloat - tileCoords.x) * 256);
    const y = Math.round((yFloat - tileCoords.y) * 256);
    return { x: Math.max(1, Math.min(x, 255)), y: Math.max(1, Math.min(y, 255)) };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private pixelPolygonToLatLng(geoJson: any, tileCoords: { x: number, y: number }, zoom: number): any {
    if (geoJson.type !== 'Polygon' || !geoJson.coordinates?.[0]) return geoJson;
    const n = Math.pow(2, zoom);
    const newCoords = geoJson.coordinates[0].map((pt: number[]) => {
      const globalX = tileCoords.x + pt[0] / 256;
      const globalY = tileCoords.y + pt[1] / 256;
      const lng = globalX / n * 360 - 180;
      const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * globalY / n)));
      return [lng, latRad * 180 / Math.PI];
    });
    return { type: 'Polygon', coordinates: [newCoords] };
  }

  private calculateAreaHa(bounds: L.LatLngBounds): number {
    const R = 6371000;
    const dLat = (bounds.getNorth() - bounds.getSouth()) * Math.PI / 180;
    const dLng = (bounds.getEast() - bounds.getWest()) * Math.PI / 180;
    const areaM2 = R * R * Math.abs(dLat) * Math.abs(dLng) * Math.cos((bounds.getSouth() + bounds.getNorth()) * Math.PI / 360);
    return Math.round(areaM2 / 10000 * 100) / 100;
  }

  private drawApproximatePolygon(lat: number, lng: number): void {
    const d = 0.002;
    const geom = { type: 'Polygon', coordinates: [[[lng-d, lat-d], [lng+d, lat-d], [lng+d, lat+d], [lng-d, lat+d], [lng-d, lat-d]]] };
    if (this.parcelLayer) this.map!.removeLayer(this.parcelLayer);
    this.parcelLayer = L.geoJSON({ type: 'Feature', geometry: geom as any, properties: {} } as any, {
      style: { color: '#ffaa00', weight: 3, opacity: 0.9, fillColor: '#ffaa00', fillOpacity: 0.2 }
    }).addTo(this.map!);
    this.newParcelData.parcel_area_ha = 4.0;
    this.newParcelData.polygon_geojson = JSON.stringify(geom);
    this.segmentationDone = true;
  }

  // --- LEAFLET EDITING ---
  enableEditing(): void {
    if (!this.parcelLayer || !this.map) return;
    this.isEditing = true;
    this.editableCoords = [];
    this.parcelLayer.eachLayer((layer: any) => {
      if (layer.getLatLngs) {
        const latlngs: L.LatLng[] = layer.getLatLngs()[0];
        this.editableCoords = latlngs.map(ll => [ll.lat, ll.lng]);
      }
    });
    this.clearVertexMarkers();
    this.editableCoords.forEach((coord, i) => {
      const marker = L.marker([coord[0], coord[1]], {
        draggable: true,
        icon: L.divIcon({ className: '', html: '<div style="width:12px;height:12px;background:white;border:2px solid #2d8a4e;border-radius:50%;cursor:grab"></div>', iconSize: [12, 12], iconAnchor: [6, 6] })
      });
      marker.on('drag', (e: any) => {
        const pos = e.target.getLatLng();
        this.editableCoords[i] = [pos.lat, pos.lng];
        if (this.parcelLayer) {
          const lls = this.editableCoords.map(c => L.latLng(c[0], c[1]));
          this.parcelLayer.eachLayer((l: any) => { if (l.setLatLngs) l.setLatLngs([lls]); });
        }
      });
      marker.addTo(this.map!);
      this.vertexMarkers.push(marker);
    });
  }

  confirmEditing(): void {
    this.clearVertexMarkers();
    this.isEditing = false;
    if (this.editableCoords.length > 0) {
      const closed = [...this.editableCoords, this.editableCoords[0]];
      this.newParcelData.polygon_geojson = JSON.stringify({ type: 'Polygon', coordinates: [closed.map(c => [c[1], c[0]])] });
      if (this.parcelLayer) this.newParcelData.parcel_area_ha = this.calculateAreaHa(this.parcelLayer.getBounds());
    }
  }

  cancelEditing(): void {
    this.clearVertexMarkers();
    this.isEditing = false;
    if (this.newParcelData.polygon_geojson && this.map) {
      if (this.parcelLayer) this.map.removeLayer(this.parcelLayer);
      try {
        const geoJson = JSON.parse(this.newParcelData.polygon_geojson);
        this.parcelLayer = L.geoJSON(geoJson as any, { style: { color: '#00ff88', weight: 3, opacity: 1.0, fillColor: '#00ff88', fillOpacity: 0.25 } }).addTo(this.map);
      } catch (_) {}
    }
  }

  private clearVertexMarkers(): void {
    if (this.map) this.vertexMarkers.forEach(m => this.map!.removeLayer(m));
    this.vertexMarkers = [];
  }

  // --- SUBMIT ---
  submitNewParcel(): void {
    if (!this.isFormValid) return;
    this.isCreating = true;
    
    const body = {
      name: this.newParcelData.name || 'Nouvelle parcelle',
      crop: this.newParcelData.main_crop,
      region: this.newParcelData.governorate,
      area_ha: this.newParcelData.parcel_area_ha,
      polygon_geojson: this.newParcelData.polygon_geojson
    };

    this.parcelsService.createParcel(body).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadParcels();
      },
      error: () => {
        // Show error ideally, but for now we close and reload to see if it worked
        this.closeAddModal();
        this.loadParcels();
      }
    });
  }
}
