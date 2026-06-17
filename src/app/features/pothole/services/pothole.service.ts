import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pothole, GeoLocation, SeverityLevel, LanePosition } from '../models/pothole.model';

const STORAGE_KEY = 'pothole_alerts_data';

@Injectable({ providedIn: 'root' })
export class PotholeService {
  private potholes$ = new BehaviorSubject<Pothole[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get allPotholes(): Observable<Pothole[]> {
    return this.potholes$.asObservable();
  }

  get snapshot(): Pothole[] {
    return this.potholes$.getValue();
  }

  addPothole(
    location: GeoLocation,
    severity: SeverityLevel,
    description: string,
    reportedBy: string,
    lanePosition: LanePosition = 'center',
  ): Pothole {
    const pothole: Pothole = {
      id: crypto.randomUUID(),
      location,
      severity,
      lanePosition,
      description,
      reportedAt: new Date().toISOString(),
      reportedBy: reportedBy || 'Anonymous',
      resolved: false,
    };

    const current = this.potholes$.getValue();
    const updated = [pothole, ...current];
    this.potholes$.next(updated);
    this.saveToStorage(updated);
    return pothole;
  }

  removePothole(id: string): void {
    const updated = this.potholes$.getValue().filter(p => p.id !== id);
    this.potholes$.next(updated);
    this.saveToStorage(updated);
  }

  toggleResolved(id: string): void {
    const updated = this.potholes$.getValue().map(p => (p.id === id ? { ...p, resolved: !p.resolved } : p));
    this.potholes$.next(updated);
    this.saveToStorage(updated);
  }

  getActivePotholes(): Pothole[] {
    return this.potholes$.getValue().filter(p => !p.resolved);
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const valid = Array.isArray(parsed)
          ? parsed
              .filter((p: unknown): boolean => {
                if (p == null || typeof p !== 'object') return false;
                const r = p as Record<string, unknown>;
                const loc = r['location'] as Record<string, unknown> | null;
                return (
                  typeof r['id'] === 'string' &&
                  loc != null &&
                  typeof loc['lat'] === 'number' &&
                  typeof loc['lng'] === 'number' &&
                  typeof r['severity'] === 'string' &&
                  typeof r['resolved'] === 'boolean'
                );
              })
              .map((p: unknown) => {
                const rec = p as Pothole;
                return { ...rec, lanePosition: rec.lanePosition || 'center' };
              })
          : [];
        this.potholes$.next(valid as Pothole[]);
      }
    } catch {
      this.potholes$.next([]);
    }
  }

  private saveToStorage(potholes: Pothole[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(potholes));
    } catch {
      // Storage full or unavailable
    }
  }
}
