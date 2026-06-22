import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from './profile.service';
import api from '../../../core/api';

vi.mock('../../../core/api');

const mockedApi = vi.mocked(api);

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('get: fetches profile by username', async () => {
    const profile = { username: 'testuser', following: false };
    mockedApi.get.mockResolvedValue({ data: { profile } });

    const result = await profileService.get('testuser');
    expect(mockedApi.get).toHaveBeenCalledWith('/profiles/testuser');
    expect(result).toEqual(profile);
  });

  it('follow: posts to follow endpoint', async () => {
    const profile = { username: 'testuser', following: true };
    mockedApi.post.mockResolvedValue({ data: { profile } });

    const result = await profileService.follow('testuser');
    expect(mockedApi.post).toHaveBeenCalledWith('/profiles/testuser/follow', {});
    expect(result).toEqual(profile);
  });

  it('unfollow: deletes follow', async () => {
    const profile = { username: 'testuser', following: false };
    mockedApi.delete.mockResolvedValue({ data: { profile } });

    const result = await profileService.unfollow('testuser');
    expect(mockedApi.delete).toHaveBeenCalledWith('/profiles/testuser/follow');
    expect(result).toEqual(profile);
  });
});
