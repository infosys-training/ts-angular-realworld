import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthProvider';
import { tagsService } from '../services/tags.service';
import { ArticleList } from '../components/ArticleList';
import type { ArticleListConfig } from '../models/article-list-config.model';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { tag } = useParams<{ tag?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const feed = searchParams.get('feed');
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  useEffect(() => {
    tagsService.getAll().then(t => {
      setTags(t);
      setTagsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (feed === 'following' && !isAuthenticated) {
      navigate('/login');
    }
  }, [feed, isAuthenticated, navigate]);

  const listConfig: ArticleListConfig = useMemo(() => {
    if (tag) {
      return { type: 'all', filters: { tag } };
    }
    if (feed === 'following') {
      return { type: 'feed', filters: {} };
    }
    return { type: 'all', filters: {} };
  }, [tag, feed]);

  const isFollowingFeed = listConfig.type === 'feed';

  const onPageChange = (page: number) => {
    const params: Record<string, string> = {};
    if (feed) params.feed = feed;
    if (page > 1) params.page = String(page);
    setSearchParams(params);
  };

  return (
    <div className="home-page">
      {!isAuthenticated && (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>
              A place to share your <i>React</i> knowledge.
            </p>
          </div>
        </div>
      )}

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {isAuthenticated && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${listConfig.type === 'feed' ? 'active' : ''}`}
                      to="/?feed=following"
                      style={{ cursor: 'pointer' }}
                    >
                      Your Feed
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    className={`nav-link ${listConfig.type === 'all' && !listConfig.filters.tag ? 'active' : ''}`}
                    to="/"
                    style={{ cursor: 'pointer' }}
                  >
                    Global Feed
                  </Link>
                </li>
                {listConfig.filters.tag && (
                  <li className="nav-item">
                    <span className="nav-link active">
                      <i className="ion-pound"></i> {listConfig.filters.tag}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <ArticleList
              config={listConfig}
              limit={10}
              currentPage={currentPage}
              isFollowingFeed={isFollowingFeed}
              onPageChange={onPageChange}
            />
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>

              {tagsLoaded ? (
                tags.length > 0 ? (
                  <div className="tag-list">
                    {tags.map(t => (
                      <Link key={t} className="tag-default tag-pill" to={`/tag/${t}`} style={{ cursor: 'pointer' }}>
                        {t}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div>No tags are here... yet.</div>
                )
              ) : (
                <div>Loading tags...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
