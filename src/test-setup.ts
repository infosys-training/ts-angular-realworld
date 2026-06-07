import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideZonelessChangeDetection } from '@angular/core';

// Initialize the Angular testing environment once (zoneless)
try {
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: true },
    providers: [provideZonelessChangeDetection()],
  });
} catch (error) {
  console.error('TestBed initialization failed:', error);
}
