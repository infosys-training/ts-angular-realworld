import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './core/layout/Header';
import { Footer } from './core/layout/Footer';
import { useAuth } from './core/auth/AuthProvider';

const HomePage = lazy(() => import('./features/article/pages/HomePage'));
const AuthPage = lazy(() => import('./core/auth/AuthPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const EditorPage = lazy(() => import('./features/article/pages/EditorPage'));
const ArticlePage = lazy(() => import('./features/article/pages/ArticlePage'));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'));
const ProfileArticles = lazy(() => import('./features/profile/components/ProfileArticles'));
const ProfileFavorites = lazy(() => import('./features/profile/components/ProfileFavorites'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authState } = useAuth();
  if (authState === 'loading') return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tag/:tag" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <RequireGuest>
                <AuthPage />
              </RequireGuest>
            }
          />
          <Route
            path="/register"
            element={
              <RequireGuest>
                <AuthPage />
              </RequireGuest>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/editor"
            element={
              <RequireAuth>
                <EditorPage />
              </RequireAuth>
            }
          />
          <Route
            path="/editor/:slug"
            element={
              <RequireAuth>
                <EditorPage />
              </RequireAuth>
            }
          />
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
