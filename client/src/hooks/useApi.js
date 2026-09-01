import { useCallback, useEffect, useState } from 'react';

/**
 * Minimal data-fetching hook. Deliberately small - the API surface here does
 * not justify a caching library, and this keeps the data flow easy to explain.
 *
 * @param {Function} fetcher  async function returning the data
 * @param {Array} deps        re-run when these change
 */
export default function useApi(fetcher, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        if (alive) setData(result);
      } catch (err) {
        if (alive) setError(err.message || 'Something went wrong');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  return { data, loading, error, refetch: run, setData };
}
