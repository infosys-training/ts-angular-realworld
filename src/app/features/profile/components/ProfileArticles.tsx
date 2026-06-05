import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleList } from '../../article/components/ArticleList';
import type { ArticleListConfig } from '../../article/models/article-list-config.model';

export default function ProfileArticles() {
  const { username } = useParams<{ username: string }>();
  const [config, setConfig] = useState<ArticleListConfig | null>(null);

  useEffect(() => {
    if (username) {
      setConfig({
        type: 'all',
        filters: { author: username },
      });
    }
  }, [username]);

  if (!config) return null;

  return <ArticleList config={config} limit={10} />;
}
