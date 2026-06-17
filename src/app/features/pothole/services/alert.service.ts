import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, combineLatest, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocationService } from './location.service';
import { PotholeService } from './pothole.service';
import { PotholeAlert, GeoLocation } from '../models/pothole.model';

const DEFAULT_ALERT_RADIUS = 500; // meters
const CHECK_INTERVAL = 3000; // ms

@Injectable({ providedIn: 'root' })
export class AlertService implements OnDestroy {
  private locationService = inject(LocationService);
  private potholeService = inject(PotholeService);

  private activeAlerts$ = new BehaviorSubject<PotholeAlert[]>([]);
  private alertHistory$ = new BehaviorSubject<PotholeAlert[]>([]);
  private alertRadius$ = new BehaviorSubject<number>(DEFAULT_ALERT_RADIUS);
  private alertsEnabled$ = new BehaviorSubject<boolean>(true);
  private subscription: Subscription | null = null;
  private alertedIds = new Set<string>();

  get alerts(): Observable<PotholeAlert[]> {
    return this.activeAlerts$.asObservable();
  }

  get history(): Observable<PotholeAlert[]> {
    return this.alertHistory$.asObservable();
  }

  get alertRadius(): Observable<number> {
    return this.alertRadius$.asObservable();
  }

  get enabled(): Observable<boolean> {
    return this.alertsEnabled$.asObservable();
  }

  setAlertRadius(meters: number): void {
    this.alertRadius$.next(meters);
  }

  toggleAlerts(enable: boolean): void {
    this.alertsEnabled$.next(enable);
    if (!enable) {
      this.activeAlerts$.next([]);
    }
  }

  startMonitoring(): void {
    if (this.subscription) return;

    this.subscription = combineLatest([interval(CHECK_INTERVAL), this.alertsEnabled$])
      .pipe(filter(([, enabled]) => enabled))
      .subscribe(() => this.checkProximity());
  }

  stopMonitoring(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.activeAlerts$.next([]);
    this.alertedIds.clear();
  }

  dismissAlert(potholeId: string): void {
    const current = this.activeAlerts$.getValue();
    this.activeAlerts$.next(current.filter(a => a.pothole.id !== potholeId));
  }

  clearHistory(): void {
    this.alertHistory$.next([]);
  }

  private checkProximity(): void {
    const location: GeoLocation | null = this.locationService.currentSnapshot;
    if (!location) return;

    const potholes = this.potholeService.getActivePotholes();
    const radius = this.alertRadius$.getValue();

    // Auto-dismiss alerts for potholes the driver has passed
    const currentAlerts = this.activeAlerts$.getValue();
    const stillRelevant = currentAlerts.filter(a => {
      const dist = this.locationService.calculateDistance(location, a.pothole.location);
      return dist <= radius * 2;
    });
    if (stillRelevant.length !== currentAlerts.length) {
      this.activeAlerts$.next(stillRelevant);
    }

    // Clean up alertedIds for resolved/deleted/far-away potholes
    this.alertedIds.forEach(id => {
      const pothole = potholes.find(p => p.id === id);
      if (!pothole) {
        this.alertedIds.delete(id);
      } else {
        const dist = this.locationService.calculateDistance(location, pothole.location);
        if (dist > radius * 2) {
          this.alertedIds.delete(id);
        }
      }
    });

    // Only alert for the nearest pothole that hasn't been alerted yet
    if (this.activeAlerts$.getValue().length > 0) return;

    let nearest: { pothole: (typeof potholes)[0]; distance: number } | null = null;

    for (const pothole of potholes) {
      if (this.alertedIds.has(pothole.id)) continue;
      const distance = this.locationService.calculateDistance(location, pothole.location);
      if (distance <= radius && (!nearest || distance < nearest.distance)) {
        nearest = { pothole, distance };
      }
    }

    if (nearest) {
      const alert: PotholeAlert = {
        pothole: nearest.pothole,
        distance: Math.round(nearest.distance),
        timestamp: new Date().toISOString(),
      };
      this.alertedIds.add(nearest.pothole.id);
      this.activeAlerts$.next([alert]);
      this.playAlertSound();

      const currentHistory = this.alertHistory$.getValue();
      this.alertHistory$.next([alert, ...currentHistory].slice(0, 50));
    }
  }

  private playAlertSound(): void {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'triangle';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
      oscillator.onended = () => ctx.close();
    } catch {
      // Audio not available
    }
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}
