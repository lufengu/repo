import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchQrImage } from '../services/qrService';

export default function useQrImage(url, options = {}) {
  const { token, enabled = true, preferSignedUrl = true } = options;
  const [src, setSrc] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(url && enabled));
  const abortRef = useRef();

  const load = useCallback(async () => {
    if (!url || !enabled) {
      setSrc(null);
      setMeta(null);
      setError(null);
      setLoading(false);
      return;
    }
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const { src, meta } = await fetchQrImage(url, { token, preferSignedUrl, signal: controller.signal });
      setSrc(src || null);
      setMeta(meta || null);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e);
        setSrc(null);
        setMeta(null);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [url, token, enabled, preferSignedUrl]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort?.();
  }, [load]);

  return { src, meta, error, loading, refetch: load };
}