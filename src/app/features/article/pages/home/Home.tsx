import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../core/auth/auth.context';
import { tagsService } from '../../services/tags.service';
import { ArticleList } from '../../components/ArticleList';
import { ArticleListConfig } from '../../models/article-list-config.model';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { tag } = useParams<{ tag?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const listConfig = useMemo<ArticleListConfig>(() => {
    if (tag) {
      return { type: 'all', filters: { tag } };
    } else if (feed === 'following') {
      return { type: 'feed', filters: {} };
    } else {
      return { type: 'all', filters: {} };
    }
  }, [tag, feed]);

  const isFollowingFeed = listConfig.type === 'feed';

  const onPageChange = useCallback(
    (page: number) => {
      const params: Record<string, string> = {};
      if (feed) params.feed = feed;
      if (page > 1) params.page = String(page);
      navigate({ search: new URLSearchParams(params).toString() });
    },
    [feed, navigate],
  );

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
                    <Link className={`nav-link ${listConfig.type === 'feed' ? 'active' : ''}`} to="/?feed=following">
                      Your Feed
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    className={`nav-link ${listConfig.type === 'all' && !listConfig.filters.tag ? 'active' : ''}`}
                    to="/"
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
              limit={10}
              config={listConfig}
              currentPage={currentPage}
              isFollowingFeed={isFollowingFeed}
              onPageChange={onPageChange}
            />
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>

              <div className="tag-list">
                {tags.map(t => (
                  <Link key={t} className="tag-default tag-pill" to={`/tag/${t}`}>
                    {t}
                  </Link>
                ))}
              </div>

              {!tagsLoaded && <div>Loading tags...</div>}

              {tagsLoaded && tags.length === 0 && <div>No tags are here... yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
