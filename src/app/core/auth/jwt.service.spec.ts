import { describe, it, expect, beforeEach } from 'vitest';
import { jwtService } from './jwt.service';

describe('jwtService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(jwtService.getToken()).toBeNull();
  });

  it('saves and retrieves a token', () => {
    jwtService.saveToken('test-token');
    expect(jwtService.getToken()).toBe('test-token');
  });

  it('destroys the token', () => {
    jwtService.saveToken('test-token');
    jwtService.destroyToken();
    expect(jwtService.getToken()).toBeNull();
  });

  it('overwrites existing token', () => {
    jwtService.saveToken('first');
    jwtService.saveToken('second');
    expect(jwtService.getToken()).toBe('second');
  });
});
