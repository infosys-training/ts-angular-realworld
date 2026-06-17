import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/pothole/pages/dashboard/dashboard.component'),
  },
  {
    path: 'report',
    loadComponent: () => import('./features/pothole/pages/report/report.component'),
  },
  {
    path: 'potholes',
    loadComponent: () => import('./features/pothole/pages/pothole-list/pothole-list.component'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
