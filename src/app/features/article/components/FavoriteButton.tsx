import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/auth.context';
import { articlesService } from '../services/articles.service';
import { Article } from '../models/article.model';

interface FavoriteButtonProps {
  article: Article;
  onToggle: (favorited: boolean) => void;
  children?: ReactNode;
}

export function FavoriteButton({ article, onToggle, children }: FavoriteButtonProps) {
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
      className={`btn btn-sm ${isSubmitting ? 'disabled' : ''} ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={handleClick}
    >
      <i className="ion-heart"></i> {children}
    </button>
  );
}
