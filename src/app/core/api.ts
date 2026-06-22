import axios from 'axios';
import { jwtService } from './auth/jwt.service';

const api = axios.create({
  baseURL: 'https://api.realworld.show/api',
});

api.interceptors.request.use(config => {
  const token = jwtService.getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const body =
        error.response.data && typeof error.response.data === 'object' && 'errors' in error.response.data
          ? error.response.data
          : { errors: { network: ['Unable to connect. Please check your internet connection.'] } };

      if (status === 401 && !error.config?.url?.endsWith('/user')) {
        window.dispatchEvent(new CustomEvent('auth:purge'));
      }

      return Promise.reject({ ...body, status });
    }

    return Promise.reject({
      errors: { network: ['Unable to connect. Please check your internet connection.'] },
      status: 0,
    });
  },
);

export default api;
