import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request } from './api';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [posts, setPosts] = useState([]);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteError, setSiteError] = useState('');

  const refreshSite = useCallback(async () => {
    setSiteLoading(true);
    setSiteError('');
    try {
      const result = await request('/public/site');
      setSite(result);
      return result;
    } catch (error) {
      setSiteError(error.message);
      throw error;
    } finally {
      setSiteLoading(false);
    }
  }, []);

  const refreshPosts = useCallback(async () => {
    const result = await request('/public/posts');
    setPosts(result);
    return result;
  }, []);

  useEffect(() => {
    refreshSite().catch(() => {});
    refreshPosts().catch(() => {});
  }, [refreshSite, refreshPosts]);

  const value = useMemo(() => ({
    site,
    setSite,
    posts,
    setPosts,
    siteLoading,
    siteError,
    refreshSite,
    refreshPosts,
  }), [site, posts, siteLoading, siteError, refreshSite, refreshPosts]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside SiteProvider');
  return context;
}
