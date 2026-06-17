import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  inject,
  input,
  output,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import * as L from 'leaflet';
import { GeoLocation, LanePosition, Pothole, SeverityLevel } from '../../models/pothole.model';
import { LocationService } from '../../services/location.service';
import { Subscription } from 'rxjs';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: '#f59e0b',
  medium: '#f97316',
  high: '#ef4444',
};

const LANE_LABELS: Record<LanePosition, string> = {
  left: '⬅️ Left side',
  center: '⚪ Center',
  right: '➡️ Right side',
};

const VALID_SEVERITIES = new Set<string>(['low', 'medium', 'high']);

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

@Component({
  selector: 'app-pothole-map',
  templateUrl: './map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .map-container {
      width: 100%;
      height: 100%;
      min-height: 400px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `,
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private locationService = inject(LocationService);
  private subscription = new Subscription();

  mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  potholes = input<Pothole[]>([]);
  clickable = input<boolean>(false);
  mapClick = output<GeoLocation>();

  private map!: L.Map;
  private userMarker: L.CircleMarker | null = null;
  private potholeMarkers: L.CircleMarker[] = [];
  private initialized = false;

  ngAfterViewInit(): void {
    this.initMap();
    this.subscription.add(
      this.locationService.location.subscribe(loc => {
        if (loc) this.updateUserLocation(loc);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.map) this.map.remove();
  }

  updatePotholeMarkers(potholes: Pothole[]): void {
    this.potholeMarkers.forEach(m => m.remove());
    this.potholeMarkers = [];

    for (const pothole of potholes) {
      const safeSeverity = (VALID_SEVERITIES.has(pothole.severity) ? pothole.severity : 'low') as SeverityLevel;
      const marker = L.circleMarker([pothole.location.lat, pothole.location.lng], {
        radius: safeSeverity === 'high' ? 12 : safeSeverity === 'medium' ? 10 : 8,
        fillColor: SEVERITY_COLORS[safeSeverity],
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(this.map);
      const safeDescription = escapeHtml(pothole.description || 'No description');
      const safeDate = escapeHtml(new Date(pothole.reportedAt).toLocaleDateString());

      const safeLane = LANE_LABELS[pothole.lanePosition] || LANE_LABELS['center'];

      marker.bindPopup(
        `<div style="font-family: sans-serif; min-width: 150px;">
          <strong style="color: ${SEVERITY_COLORS[safeSeverity as SeverityLevel]}; text-transform: uppercase;">${escapeHtml(safeSeverity)} severity</strong>
          <p style="margin: 4px 0; font-weight: 600;">${escapeHtml(safeLane)}</p>
          <p style="margin: 4px 0;">${safeDescription}</p>
          <small style="color: #666;">Reported: ${safeDate}</small>
        </div>`,
      );

      this.potholeMarkers.push(marker);
    }
  }

  private initMap(): void {
    const el = this.mapContainer().nativeElement;
    this.map = L.map(el, { zoomControl: true }).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    if (this.clickable()) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.mapClick.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    this.initialized = true;
    this.updatePotholeMarkers(this.potholes());
  }

  private updateUserLocation(location: GeoLocation): void {
    if (!this.initialized) return;

    if (this.userMarker) {
      this.userMarker.setLatLng([location.lat, location.lng]);
    } else {
      this.userMarker = L.circleMarker([location.lat, location.lng], {
        radius: 10,
        fillColor: '#3b82f6',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(this.map);
      this.userMarker.bindPopup('<strong>You are here</strong>');
      this.map.setView([location.lat, location.lng], 15);
    }
  }
}
