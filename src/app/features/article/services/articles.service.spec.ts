import { describe, it, expect, vi, beforeEach } from 'vitest';
import { articlesService } from './articles.service';
import api from '../../../core/api';

vi.mock('../../../core/api');

const mockedApi = vi.mocked(api);

describe('articlesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('query: sends GET /articles with params', async () => {
    const mockData = { articles: [], articlesCount: 0 };
    mockedApi.get.mockResolvedValue({ data: mockData });

    const result = await articlesService.query({ type: 'all', filters: { tag: 'test' } });
    expect(mockedApi.get).toHaveBeenCalledWith('/articles', { params: expect.any(URLSearchParams) });
    expect(result).toEqual(mockData);
  });

  it('query: sends GET /articles/feed for feed type', async () => {
    const mockData = { articles: [], articlesCount: 0 };
    mockedApi.get.mockResolvedValue({ data: mockData });

    await articlesService.query({ type: 'feed', filters: {} });
    expect(mockedApi.get).toHaveBeenCalledWith('/articles/feed', { params: expect.any(URLSearchParams) });
  });

  it('get: fetches a single article by slug', async () => {
    const article = { slug: 'test-slug', title: 'Test' };
    mockedApi.get.mockResolvedValue({ data: { article } });

    const result = await articlesService.get('test-slug');
    expect(mockedApi.get).toHaveBeenCalledWith('/articles/test-slug');
    expect(result).toEqual(article);
  });

  it('create: posts a new article', async () => {
    const article = { slug: 'new', title: 'New' };
    mockedApi.post.mockResolvedValue({ data: { article } });

    const result = await articlesService.create({ title: 'New' });
    expect(mockedApi.post).toHaveBeenCalledWith('/articles/', { article: { title: 'New' } });
    expect(result).toEqual(article);
  });

  it('favorite: posts to favorite endpoint', async () => {
    const article = { slug: 'fav', favorited: true };
    mockedApi.post.mockResolvedValue({ data: { article } });

    const result = await articlesService.favorite('fav');
    expect(mockedApi.post).toHaveBeenCalledWith('/articles/fav/favorite', {});
    expect(result).toEqual(article);
  });
});
