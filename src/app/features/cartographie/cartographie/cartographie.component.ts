/// <reference types="geojson" />
import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-draw';

@Component({
  selector: 'app-cartographie',
  templateUrl: './cartographie.component.html',
  styleUrl: './cartographie.component.css'
})
export class CartographieComponent implements AfterViewInit {
  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 200);
  }

  private initMap(): void {
    const COLORS: any = {
        'extensif':       '#27ae60',
        'intensif':       '#f39c12',
        'hyper-intensif': '#e74c3c',
        'inconnu':        '#95a5a6',
    };

    let map: any, drawnItems: any, currentPolygon: any = null, currentLayer: any = null;
    let lastGeoJSON: any = null;

    // Initialisation de la carte
    map = L.map('map').setView([34.5, 9.5], 7);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri © OpenStreetMap'
    }).addTo(map);

    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
            polygon:   {} as L.DrawOptions.PolygonOptions,
            rectangle: {} as L.DrawOptions.RectangleOptions,
            circle:    false,
            marker:    false,
            polyline:  false,
            circlemarker: false,
        }
    });
    map.addControl(drawControl);

    map.on('draw:created', (e: any) => {
        drawnItems.clearLayers();
        currentPolygon = e.layer;
        drawnItems.addLayer(currentPolygon);
        this.setStatus('Zone prête — cliquez Analyser', '#27ae60');
    });

    // Gestion du bouton Effacer
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            drawnItems.clearLayers();
            if (currentLayer) map.removeLayer(currentLayer);
            currentPolygon = null;
            currentLayer   = null;
            lastGeoJSON    = null;
            const statsPanel = document.getElementById('statsPanel');
            if (statsPanel) statsPanel.style.display = 'none';
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) exportBtn.style.display = 'none';
            this.setStatus('Dessinez une zone sur la carte', '#1a5c2a');
        };
    }

    // Gestion du bouton Analyser
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.onclick = async () => {
            if (!currentPolygon) {
                alert('Dessinez une zone sur la carte d\'abord');
                return;
            }

            const geojson = currentPolygon.toGeoJSON();
            const polygone_perimetre = geojson.geometry;

            (analyzeBtn as HTMLButtonElement).disabled = true;
            this.showLoading('🛰️ Lecture des données Sentinel-2...');
            this.setStatus('⏳ Analyse en cours...', '#f39c12');

            this.http.post<any>('http://20.240.59.225:8000/api/cartographier', {
                polygone_perimetre: polygone_perimetre,
                date: new Date().toISOString().slice(0, 10)
            }).subscribe({
                next: (data) => {
                    this.hideLoading();

                    if (!data.success) {
                        alert(data.error || 'Erreur inconnue');
                        (analyzeBtn as HTMLButtonElement).disabled = false;
                        return;
                    }

                    if (data.oliveraies.length === 0) {
                        this.setStatus('✅ Aucune oliveraie détectée dans cette zone', '#95a5a6');
                        (analyzeBtn as HTMLButtonElement).disabled = false;
                        return;
                    }

                    if (currentLayer) map.removeLayer(currentLayer);

                    const fc: GeoJSON.FeatureCollection = {
                        type: 'FeatureCollection' as const,
                        features: data.oliveraies.map((o: any) => ({
                            type: 'Feature',
                            geometry: o.polygone,
                            properties: {
                                systeme:    o.systeme,
                                confiance:  o.confiance,
                                surface_ha: o.surface_ha,
                                color:      o.color,
                            }
                        }))
                    };

                    currentLayer = L.geoJSON(fc, {
                        style: (feature: any) => ({
                            color:       feature.properties.color,
                            weight:      2,
                            fillColor:   feature.properties.color,
                            fillOpacity: 0.55,
                        }),
                        onEachFeature: (feature: any, layer: any) => {
                            const p = feature.properties;
                            layer.bindPopup(`
                                <b>🌿 Oliveraie</b><br>
                                Système : <b style="color:${p.color}">${p.systeme}</b><br>
                                Surface : <b>${p.surface_ha} ha</b><br>
                                Confiance : <b>${(p.confiance * 100).toFixed(0)}%</b>
                            `);
                        }
                    }).addTo(map);

                    map.fitBounds(currentLayer.getBounds());

                    const s = data.stats;
                    const totalOliveraies = document.getElementById('totalOliveraies');
                    if (totalOliveraies) totalOliveraies.innerHTML = s.total_oliveraies;
                    const totalSurface = document.getElementById('totalSurface');
                    if (totalSurface) totalSurface.innerHTML = s.surface_totale_ha;
                    const surfaceMoy = document.getElementById('surfaceMoy');
                    if (surfaceMoy) surfaceMoy.innerHTML = s.surface_moyenne_ha;

                    const tbody = document.getElementById('systemTableBody');
                    if (tbody) {
                        tbody.innerHTML = '';
                        const surfParSysteme: any = {};
                        data.oliveraies.forEach((o: any) => {
                            if (!surfParSysteme[o.systeme]) {
                                surfParSysteme[o.systeme] = { count: 0, surface: 0 };
                            }
                            surfParSysteme[o.systeme].count   += 1;
                            surfParSysteme[o.systeme].surface += o.surface_ha;
                        });

                        Object.entries(surfParSysteme).forEach(([systeme, info]: [string, any]) => {
                            const color   = COLORS[systeme] || '#95a5a6';
                            const avgSurf = (info.surface / info.count).toFixed(2);
                            tbody.innerHTML += `
                                <tr>
                                    <td><span class="badge" style="background:${color}">${systeme}</span></td>
                                    <td>${info.count}</td>
                                    <td>${info.surface.toFixed(2)} ha</td>
                                    <td>${avgSurf} ha</td>
                                </tr>
                            `;
                        });
                    }

                    const statsPanel = document.getElementById('statsPanel');
                    if (statsPanel) statsPanel.style.display = 'block';

                    lastGeoJSON = fc;
                    const exportBtn = document.getElementById('exportBtn');
                    if (exportBtn) exportBtn.style.display = 'inline-block';

                    this.setStatus(`✅ ${s.total_oliveraies} oliveraies détectées`, '#27ae60');
                    (analyzeBtn as HTMLButtonElement).disabled = false;
                },
                error: (err) => {
                    this.hideLoading();
                    this.setStatus('❌ Erreur', '#e74c3c');
                    alert('Erreur : ' + err.message);
                    (analyzeBtn as HTMLButtonElement).disabled = false;
                }
            });
        };
    }

    // Gestion de l'export GeoJSON
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.onclick = () => {
            if (!lastGeoJSON) return;
            const blob = new Blob(
                [JSON.stringify(lastGeoJSON, null, 2)],
                { type: 'application/json' }
            );
            const url = URL.createObjectURL(blob);
            const a   = document.createElement('a');
            a.href     = url;
            a.download = `oliveraies_${new Date().toISOString().slice(0,10)}.geojson`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }
  }

  setStatus(msg: string, color: string): void {
      const el = document.getElementById('status');
      if (el) {
          el.innerHTML = msg;
          el.style.background = color || '#27ae60';
      }
  }

  showLoading(msg: string): void {
      const msgEl = document.getElementById('loadingMsg');
      if (msgEl) msgEl.innerHTML = msg || 'Analyse en cours...';
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.style.display = 'flex';
  }

  hideLoading(): void {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) overlay.style.display = 'none';
  }
}

