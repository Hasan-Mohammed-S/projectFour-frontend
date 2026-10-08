import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

export function useResource(path, poll = false) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ path: null, data: null, error: '' });
  
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  
  useEffect(() => {
    if (!path) {
      return;
    }
    
    const controller = new AbortController();
    
    api(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ path, data, error: '' });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResult((old) => ({
            path,
            data: old.path === path ? old.data : null,
            error: error.message
          }));
        }
      });
      
    return () => controller.abort();
  }, [path, revision]);
  
  useEffect(() => {
    if (!poll || !path) {
      return;
    }
    
    const interval = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [path, poll, refresh]);
  
  return {
    data: result.path === path ? result.data : null,
    error: result.path === path ? result.error : '',
    loading: Boolean(path) && (result.path !== path || (!result.data && !result.error)),
    refresh
  };
}