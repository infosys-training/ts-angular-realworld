import { Routes, Route } from 'react-router-dom';
import { Header } from './core/layout/Header';
import { Footer } from './core/layout/Footer';
import { RequireAuth, RequireGuest } from './core/auth/RequireAuth';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./features/article/pages/home/Home'));
const Auth = lazy(() => import('./features/auth/Auth'));
const Settings = lazy(() => import('./features/settings/Settings'));
const Editor = lazy(() => import('./features/article/pages/editor/Editor'));
const ArticlePage = lazy(() => import('./features/article/pages/article/Article'));
const ProfilePage = lazy(() => import('./features/profile/pages/profile/Profile'));
const ProfileArticles = lazy(() => import('./features/profile/components/ProfileArticles'));
const ProfileFavorites = lazy(() => import('./features/profile/components/ProfileFavorites'));

import '../styles.css';

export function App() {
  return (
    <>
      <Header />
      <Suspense>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tag/:tag" element={<Home />} />

          <Route element={<RequireGuest />}>
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:slug" element={<Editor />} />
          </Route>

          <Route path="/article/:slug" element={<ArticlePage />} />

          <Route path="/profile/:username" element={<ProfilePage />}>
            <Route index element={<ProfileArticles />} />
            <Route path="favorites" element={<ProfileFavorites />} />
          </Route>
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
