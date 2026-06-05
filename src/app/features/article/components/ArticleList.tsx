import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ArticleListConfig } from '../models/article-list-config.model';
import type { Article } from '../models/article.model';
import { articlesService } from '../services/articles.service';
import { ArticlePreview } from './ArticlePreview';

export function ArticleList({
  config,
  limit = 10,
  currentPage = 1,
  isFollowingFeed = false,
  onPageChange,
}: {
  config: ArticleListConfig;
  limit?: number;
  currentPage?: number;
  isFollowingFeed?: boolean;
  onPageChange?: (page: number) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setLoading(true);
    setArticles([]);

    const query: ArticleListConfig = {
      ...config,
      filters: {
        ...config.filters,
        limit,
        offset: limit * (page - 1),
      },
    };

    articlesService.query(query).then(data => {
      setArticles(data.articles);
      setTotalPages(Array.from(new Array(Math.ceil(data.articlesCount / limit)), (_, i) => i + 1));
      setLoading(false);
    });
  }, [config, page, limit]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
      onPageChange?.(pageNumber);
    }
  };

  if (loading) {
    return <div className="article-preview">Loading articles...</div>;
  }

  return (
    <>
      {articles.length === 0 ? (
        <div className="article-preview empty-feed-message">
          {isFollowingFeed ? (
            <>
              Your feed is empty. Follow some users to see their articles here, or check out the{' '}
              <Link to="/">Global Feed</Link>!
            </>
          ) : (
            'No articles are here... yet.'
          )}
        </div>
      ) : (
        articles.map(article => <ArticlePreview key={article.slug} article={article} />)
      )}

      {totalPages.length > 1 && (
        <nav>
          <ul className="pagination">
            {totalPages.map(pageNumber => (
              <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => goToPage(pageNumber)}>
                  {pageNumber}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
