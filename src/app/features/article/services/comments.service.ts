import api from '../../../core/api';
import { Comment } from '../models/comment.model';

export const commentsService = {
  async getAll(slug: string): Promise<Comment[]> {
    const { data } = await api.get<{ comments: Comment[] }>(`/articles/${slug}/comments`);
    return data.comments;
  },

  async add(slug: string, body: string): Promise<Comment> {
    const { data } = await api.post<{ comment: Comment }>(`/articles/${slug}/comments`, {
      comment: { body },
    });
    return data.comment;
  },

  async delete(commentId: string, slug: string): Promise<void> {
    await api.delete(`/articles/${slug}/comments/${commentId}`);
  },
};
