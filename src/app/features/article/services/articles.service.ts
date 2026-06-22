import api from '../../../core/api';
import { ArticleListConfig } from '../models/article-list-config.model';
import { Article } from '../models/article.model';

export const articlesService = {
  async query(config: ArticleListConfig): Promise<{ articles: Article[]; articlesCount: number }> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(config.filters)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
    const url = '/articles' + (config.type === 'feed' ? '/feed' : '');
    const { data } = await api.get<{ articles: Article[]; articlesCount: number }>(url, { params });
    return data;
  },

  async get(slug: string): Promise<Article> {
    const { data } = await api.get<{ article: Article }>(`/articles/${slug}`);
    return data.article;
  },

  async delete(slug: string): Promise<void> {
    await api.delete(`/articles/${slug}`);
  },

  async create(article: Partial<Article>): Promise<Article> {
    const { data } = await api.post<{ article: Article }>('/articles/', { article });
    return data.article;
  },

  async update(article: Partial<Article>): Promise<Article> {
    const { data } = await api.put<{ article: Article }>(`/articles/${article.slug}`, { article });
    return data.article;
  },

  async favorite(slug: string): Promise<Article> {
    const { data } = await api.post<{ article: Article }>(`/articles/${slug}/favorite`, {});
    return data.article;
  },

  async unfavorite(slug: string): Promise<void> {
    await api.delete(`/articles/${slug}/favorite`);
  },
};
