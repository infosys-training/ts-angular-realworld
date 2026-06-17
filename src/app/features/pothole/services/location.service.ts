import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeoLocation } from '../models/pothole.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private zone = inject(NgZone);
  private currentLocation$ = new BehaviorSubject<GeoLocation | null>(null);
  private watchId: number | null = null;
  private tracking$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  get location(): Observable<GeoLocation | null> {
    return this.currentLocation$.asObservable();
  }

  get isTracking(): Observable<boolean> {
    return this.tracking$.asObservable();
  }

  get locationError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  get currentSnapshot(): GeoLocation | null {
    return this.currentLocation$.getValue();
  }

  get isTrackingSnapshot(): boolean {
    return this.tracking$.getValue();
  }

  startTracking(): void {
    if (this.watchId !== null) return;
    if (!('geolocation' in navigator)) {
      this.error$.next('Geolocation is not supported by your browser');
      return;
    }

    this.tracking$.next(true);
    this.error$.next(null);

    this.watchId = navigator.geolocation.watchPosition(
      position => {
        this.zone.run(() => {
          this.currentLocation$.next({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          this.error$.next(null);
        });
      },
      err => {
        this.zone.run(() => {
          this.error$.next(this.getErrorMessage(err));
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.tracking$.next(false);
  }

  calculateDistance(from: GeoLocation, to: GeoLocation): number {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'Location request timed out.';
      default:
        return 'An unknown error occurred while getting location.';
    }
  }
}
