import { api } from '../../../core/api';

export const tagsService = {
  getAll(): Promise<string[]> {
    return api.get<{ tags: string[] }>('/tags').then(data => data.tags);
  },
};
