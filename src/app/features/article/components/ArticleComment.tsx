import { Link } from 'react-router-dom';
import type { Comment } from '../models/comment.model';
import { useAuth } from '../../../core/auth/AuthProvider';
import { defaultImage, formatDate } from '../../../shared/utils';

export function ArticleComment({ comment, onDelete }: { comment: Comment; onDelete: () => void }) {
  const { user } = useAuth();
  const canModify = user?.username === comment.author.username;

  return (
    <div className="card">
      <div className="card-block">
        <p className="card-text">{comment.body}</p>
      </div>
      <div className="card-footer">
        <Link className="comment-author" to={`/profile/${comment.author.username}`}>
          <img src={defaultImage(comment.author.image)} className="comment-author-img" alt="" />
        </Link>
        &nbsp;
        <Link className="comment-author" to={`/profile/${comment.author.username}`}>
          {comment.author.username}
        </Link>
        <span className="date-posted">{formatDate(comment.createdAt)}</span>
        {canModify && (
          <span className="mod-options">
            <i className="ion-trash-a" onClick={onDelete}></i>
          </span>
        )}
      </div>
    </div>
  );
}
