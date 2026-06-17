import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AsyncPipe, UpperCasePipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PotholeService } from '../../services/pothole.service';
import { LocationService } from '../../services/location.service';
import { Pothole } from '../../models/pothole.model';

@Component({
  selector: 'app-pothole-list',
  templateUrl: './pothole-list.component.html',
  imports: [AsyncPipe, UpperCasePipe, DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PotholeListComponent {
  private potholeService = inject(PotholeService);
  private locationService = inject(LocationService);

  potholes$ = this.potholeService.allPotholes;
  location$ = this.locationService.location;

  filterMode = signal<'all' | 'active' | 'resolved'>('all');

  getFilteredPotholes(potholes: Pothole[]): Pothole[] {
    const mode = this.filterMode();
    if (mode === 'active') return potholes.filter(p => !p.resolved);
    if (mode === 'resolved') return potholes.filter(p => p.resolved);
    return potholes;
  }

  getDistance(pothole: Pothole): string {
    const loc = this.locationService.currentSnapshot;
    if (!loc) return '—';
    const dist = this.locationService.calculateDistance(loc, pothole.location);
    if (dist < 1000) return `${Math.round(dist)}m`;
    return `${(dist / 1000).toFixed(1)}km`;
  }

  toggleResolved(id: string): void {
    this.potholeService.toggleResolved(id);
  }

  remove(id: string): void {
    this.potholeService.removePothole(id);
  }

  setFilter(mode: 'all' | 'active' | 'resolved'): void {
    this.filterMode.set(mode);
  }
}
