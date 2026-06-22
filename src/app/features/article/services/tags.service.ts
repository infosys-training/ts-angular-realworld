import api from '../../../core/api';

export const tagsService = {
  async getAll(): Promise<string[]> {
    const { data } = await api.get<{ tags: string[] }>('/tags');
    return data.tags;
  },
};
