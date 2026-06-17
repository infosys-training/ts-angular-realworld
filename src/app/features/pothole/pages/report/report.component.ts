import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PotholeService } from '../../services/pothole.service';
import { LocationService } from '../../services/location.service';
import { MapComponent } from '../../components/map/map.component';
import { GeoLocation, SeverityLevel, LanePosition } from '../../models/pothole.model';

@Component({
  selector: 'app-report-pothole',
  templateUrl: './report.component.html',
  imports: [FormsModule, RouterLink, DecimalPipe, MapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportComponent {
  private potholeService = inject(PotholeService);
  private locationService = inject(LocationService);
  private router = inject(Router);

  location$ = this.locationService.location;

  selectedLocation = signal<GeoLocation | null>(null);
  severity = signal<SeverityLevel>('medium');
  lanePosition = signal<LanePosition>('center');
  description = signal<string>('');
  reporterName = signal<string>('');
  submitted = signal<boolean>(false);

  useCurrentLocation(): void {
    const loc = this.locationService.currentSnapshot;
    if (loc) {
      this.selectedLocation.set(loc);
    }
  }

  onMapClick(location: GeoLocation): void {
    this.selectedLocation.set(location);
  }

  onSeverityChange(value: string): void {
    this.severity.set(value as SeverityLevel);
  }

  onLanePositionChange(value: string): void {
    this.lanePosition.set(value as LanePosition);
  }

  submit(): void {
    const loc = this.selectedLocation();
    if (!loc) return;

    this.potholeService.addPothole(loc, this.severity(), this.description(), this.reporterName(), this.lanePosition());
    this.submitted.set(true);

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }
}
