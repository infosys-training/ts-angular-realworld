import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { articlesService } from '../services/articles.service';
import { ArticleListConfig } from '../models/article-list-config.model';
import { Article } from '../models/article.model';
import { ArticlePreview } from './ArticlePreview';
import { LoadingState } from '../../../core/models/loading-state.model';

interface ArticleListProps {
  limit: number;
  config: ArticleListConfig;
  currentPage?: number;
  isFollowingFeed?: boolean;
  onPageChange?: (page: number) => void;
}

export function ArticleList({
  limit,
  config,
  currentPage = 1,
  isFollowingFeed = false,
  onPageChange,
}: ArticleListProps) {
  const [results, setResults] = useState<Article[]>([]);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState<number[]>([]);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.NOT_LOADED);

  const runQuery = useCallback(
    async (queryConfig: ArticleListConfig, queryPage: number) => {
      setLoading(LoadingState.LOADING);
      setResults([]);

      const filters = {
        ...queryConfig.filters,
        limit,
        offset: limit * (queryPage - 1),
      };

      try {
        const data = await articlesService.query({ ...queryConfig, filters });
        setResults(data.articles);
        setTotalPages(Array.from(new Array(Math.ceil(data.articlesCount / limit)), (_, i) => i + 1));
        setLoading(LoadingState.LOADED);
      } catch {
        setLoading(LoadingState.LOADED);
      }
    },
    [limit],
  );

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    void runQuery(config, page);
  }, [config, page, runQuery]);

  const setPageTo = (pageNumber: number) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
      onPageChange?.(pageNumber);
    }
  };

  if (loading === LoadingState.LOADING) {
    return <div className="article-preview">Loading articles...</div>;
  }

  if (loading !== LoadingState.LOADED) return null;

  return (
    <>
      {results.length === 0 ? (
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
        results.map(article => <ArticlePreview key={article.slug} article={article} />)
      )}

      <nav>
        <ul className="pagination">
          {totalPages.map(pageNumber => (
            <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPageTo(pageNumber)}>
                {pageNumber}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
