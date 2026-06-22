import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentsService } from './comments.service';
import api from '../../../core/api';

vi.mock('../../../core/api');

const mockedApi = vi.mocked(api);

describe('commentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll: fetches comments for an article', async () => {
    const comments = [{ id: '1', body: 'hello' }];
    mockedApi.get.mockResolvedValue({ data: { comments } });

    const result = await commentsService.getAll('test-slug');
    expect(mockedApi.get).toHaveBeenCalledWith('/articles/test-slug/comments');
    expect(result).toEqual(comments);
  });

  it('add: posts a new comment', async () => {
    const comment = { id: '2', body: 'new comment' };
    mockedApi.post.mockResolvedValue({ data: { comment } });

    const result = await commentsService.add('test-slug', 'new comment');
    expect(mockedApi.post).toHaveBeenCalledWith('/articles/test-slug/comments', {
      comment: { body: 'new comment' },
    });
    expect(result).toEqual(comment);
  });

  it('delete: deletes a comment', async () => {
    mockedApi.delete.mockResolvedValue({});

    await commentsService.delete('comment-1', 'test-slug');
    expect(mockedApi.delete).toHaveBeenCalledWith('/articles/test-slug/comments/comment-1');
  });
});
