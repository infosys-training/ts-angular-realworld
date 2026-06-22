import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileService } from '../services/profile.service';
import { ArticleList } from '../../article/components/ArticleList';
import { ArticleListConfig } from '../../article/models/article-list-config.model';

export default function ProfileArticles() {
  const { username } = useParams<{ username: string }>();
  const [config, setConfig] = useState<ArticleListConfig | null>(null);

  useEffect(() => {
    if (!username) return;
    profileService.get(username).then(profile => {
      setConfig({
        type: 'all',
        filters: { author: profile.username },
      });
    });
  }, [username]);

  if (!config) return null;
  return <ArticleList limit={10} config={config} />;
}
