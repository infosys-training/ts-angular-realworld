import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, viewChild, signal } from '@angular/core';
import { AsyncPipe, UpperCasePipe, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { PotholeService } from '../../services/pothole.service';
import { AlertService } from '../../services/alert.service';
import { MapComponent } from '../../components/map/map.component';
import { AlertNotificationComponent } from '../../components/alert-notification/alert-notification.component';
import { Subscription, combineLatest } from 'rxjs';
import { Pothole } from '../../models/pothole.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [AsyncPipe, UpperCasePipe, DecimalPipe, DatePipe, RouterLink, MapComponent, AlertNotificationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit, OnDestroy {
  private locationService = inject(LocationService);
  private potholeService = inject(PotholeService);
  private alertService = inject(AlertService);
  private subscription = new Subscription();

  mapComponent = viewChild<MapComponent>('mapRef');

  location$ = this.locationService.location;
  tracking$ = this.locationService.isTracking;
  locationError$ = this.locationService.locationError;
  potholes$ = this.potholeService.allPotholes;
  alertsEnabled$ = this.alertService.enabled;
  alertRadius$ = this.alertService.alertRadius;

  totalPotholes = signal(0);
  activePotholes = signal(0);
  nearbyPotholes = signal(0);

  ngOnInit(): void {
    this.locationService.startTracking();
    this.alertService.startMonitoring();

    this.subscription.add(
      combineLatest([this.potholeService.allPotholes, this.locationService.location]).subscribe(
        ([potholes, location]) => {
          this.totalPotholes.set(potholes.length);
          this.activePotholes.set(potholes.filter(p => !p.resolved).length);
          this.nearbyPotholes.set(
            location
              ? potholes.filter(p => !p.resolved && this.locationService.calculateDistance(location, p.location) <= 500)
                  .length
              : 0,
          );

          const map = this.mapComponent();
          if (map) map.updatePotholeMarkers(potholes);
        },
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleTracking(): void {
    if (this.locationService.isTrackingSnapshot) {
      this.locationService.stopTracking();
      this.alertService.stopMonitoring();
    } else {
      this.locationService.startTracking();
      this.alertService.startMonitoring();
    }
  }

  toggleAlerts(): void {
    const current = this.potholeService.snapshot;
    this.alertService.toggleAlerts(current.length > 0);
  }

  getSeverityClass(pothole: Pothole): string {
    return `severity-${pothole.severity}`;
  }
}
