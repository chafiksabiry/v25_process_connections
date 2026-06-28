import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { buildTrackingPath } from './lib/tracking/pageMeta';
import { syncVisitorTracking } from './lib/tracking/visitorTracking';

export default function VisitorTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  const apply = (path: string) => {
    if (path === lastPathRef.current) return;
    lastPathRef.current = path;
    syncVisitorTracking(path);
  };

  useEffect(() => {
    apply(buildTrackingPath());
  }, [location.pathname, location.search, location.hash]);

  // Child MFE routers (auth, reps, company) push history without updating host Router.
  useEffect(() => {
    const sync = () => apply(buildTrackingPath());
    window.addEventListener('popstate', sync);

    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);
    history.pushState = (...args: Parameters<History['pushState']>) => {
      pushState(...args);
      sync();
    };
    history.replaceState = (...args: Parameters<History['replaceState']>) => {
      replaceState(...args);
      sync();
    };

    sync();

    return () => {
      window.removeEventListener('popstate', sync);
      history.pushState = pushState;
      history.replaceState = replaceState;
    };
  }, []);

  return null;
}
