import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesService } from '../services/articles.service';
import { useAuth } from '../../../core/auth/AuthProvider';
import type { Article } from '../models/article.model';

export function FavoriteButton({
  article,
  onToggle,
  children,
}: {
  article: Article;
  onToggle: (favorited: boolean) => void;
  children?: ReactNode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!article.favorited) {
        await articlesService.favorite(article.slug);
      } else {
        await articlesService.unfavorite(article.slug);
      }
      onToggle(!article.favorited);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={`btn btn-sm ${isSubmitting ? 'disabled' : ''} ${
        article.favorited ? 'btn-primary' : 'btn-outline-primary'
      }`}
      onClick={handleClick}
      disabled={isSubmitting}
    >
      <i className="ion-heart"></i> {children}
    </button>
  );
}
