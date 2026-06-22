import { describe, it, expect } from 'vitest';
import { defaultImage, formatDate } from './utils';

describe('defaultImage', () => {
  it('returns the image when provided', () => {
    expect(defaultImage('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  it('returns default avatar for null', () => {
    expect(defaultImage(null)).toBe('/assets/images/default-avatar.svg');
  });

  it('returns default avatar for undefined', () => {
    expect(defaultImage(undefined)).toBe('/assets/images/default-avatar.svg');
  });

  it('returns default avatar for empty string', () => {
    expect(defaultImage('')).toBe('/assets/images/default-avatar.svg');
  });
});

describe('formatDate', () => {
  it('formats ISO date to long date', () => {
    const result = formatDate('2024-01-15T12:00:00.000Z');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});
