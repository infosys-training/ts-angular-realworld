import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert-notification',
  templateUrl: './alert-notification.component.html',
  imports: [AsyncPipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .alert-overlay {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }

    .alert-card {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .alert-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 700;
      color: #991b1b;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .alert-distance {
      font-size: 20px;
      font-weight: 800;
      color: #dc2626;
    }

    .alert-lane {
      font-size: 14px;
      font-weight: 700;
      color: #991b1b;
      margin-top: 4px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 6px;
      display: inline-block;
    }

    .alert-description {
      font-size: 12px;
      color: #7f1d1d;
      margin-top: 4px;
    }

    .alert-dismiss {
      background: none;
      border: none;
      color: #991b1b;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
    }

    .alert-dismiss:hover {
      color: #450a0a;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
})
export class AlertNotificationComponent {
  private alertService = inject(AlertService);
  alerts$ = this.alertService.alerts;

  dismiss(potholeId: string): void {
    this.alertService.dismissAlert(potholeId);
  }
}
