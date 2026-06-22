import api from '../../../core/api';
import { Profile } from '../models/profile.model';

export const profileService = {
  async get(username: string): Promise<Profile> {
    const { data } = await api.get<{ profile: Profile }>(`/profiles/${username}`);
    return data.profile;
  },

  async follow(username: string): Promise<Profile> {
    const { data } = await api.post<{ profile: Profile }>(`/profiles/${username}/follow`, {});
    return data.profile;
  },

  async unfollow(username: string): Promise<Profile> {
    const { data } = await api.delete<{ profile: Profile }>(`/profiles/${username}/follow`);
    return data.profile;
  },
};
