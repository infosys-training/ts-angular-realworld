import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tagsService } from './tags.service';
import api from '../../../core/api';

vi.mock('../../../core/api');

const mockedApi = vi.mocked(api);

describe('tagsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll: fetches tags from /tags', async () => {
    const tags = ['angular', 'react', 'vue'];
    mockedApi.get.mockResolvedValue({ data: { tags } });

    const result = await tagsService.getAll();
    expect(mockedApi.get).toHaveBeenCalledWith('/tags');
    expect(result).toEqual(tags);
  });
});
