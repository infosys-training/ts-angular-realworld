import { ApplicationConfig, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * Debug interface for testing - exposes app state in a framework-agnostic way.
 * The pothole app has no auth, so the interface returns safe defaults.
 */
export interface ConduitDebug {
  getToken: () => string | null;
  getAuthState: () => 'unauthenticated';
  getCurrentUser: () => null;
}

declare global {
  interface Window {
    __conduit_debug__?: ConduitDebug;
  }
}

function setupDebugInterface(): void {
  window.__conduit_debug__ = {
    getToken: () => null,
    getAuthState: () => 'unauthenticated',
    getCurrentUser: () => null,
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAppInitializer(() => {
      setupDebugInterface();
    }),
  ],
};
