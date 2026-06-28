import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { buildTrackingPath } from './lib/tracking/pageMeta';
import { syncVisitorTracking } from './lib/tracking/visitorTracking';

export default function VisitorTracker() {
  const location = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    const path = buildTrackingPath();
    if (path === lastPathRef.current) return;
    lastPathRef.current = path;
    syncVisitorTracking(path);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
