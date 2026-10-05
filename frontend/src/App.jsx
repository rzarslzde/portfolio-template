import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { request } from './api';
import { LoadingScreen } from './components/Ui';

const AdminLogin = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.AdminLogin })));
const AdminOverview = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.AdminOverview })));
const AdminShell = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.AdminShell })));
const BlogManager = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.BlogManager })));
const FilesEditor = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.FilesEditor })));
const ProfileEditor = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.ProfileEditor })));
const SettingsEditor = lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.SettingsEditor })));
const BlogDetail = lazy(() => import('./components/PublicSite').then((module) => ({ default: module.BlogDetail })));
const BlogIndex = lazy(() => import('./components/PublicSite').then((module) => ({ default: module.BlogIndex })));
const HomePage = lazy(() => import('./components/PublicSite').then((module) => ({ default: module.HomePage })));
const NotFoundPage = lazy(() => import('./components/PublicSite').then((module) => ({ default: module.NotFoundPage })));
const PublicLayout = lazy(() => import('./components/PublicSite').then((module) => ({ default: module.PublicLayout })));

function AdminGuard() {
  const [state, setState] = useState('checking');
  useEffect(() => {
    if (!localStorage.getItem('ravand_admin_token')) {
      setState('guest');
      return;
    }
    request('/auth/me')
      .then(() => setState('member'))
      .catch(() => setState('guest'));
  }, []);

  if (state === 'checking') return <LoadingScreen label="در حال بررسی نشست مدیر…" />;
  if (state === 'guest') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminShell />}>
            <Route index element={<AdminOverview />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="files" element={<FilesEditor />} />
            <Route path="posts" element={<BlogManager />} />
            <Route path="settings" element={<SettingsEditor />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="blog" element={<BlogIndex />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
