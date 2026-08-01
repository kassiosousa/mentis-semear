import { useCallback, useEffect, useState } from 'react';
import type { NewSeed, Seed } from '../../domain/entities/Seed';
import { container } from '../container';

export function useSeeds() {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSeeds(await container.listSeeds.execute());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load seeds.');
    } finally {
      setLoading(false);
    }
  }, []);

  const plant = useCallback(
    async (input: NewSeed) => {
      const created = await container.createSeed.execute(input);
      setSeeds((prev) => [created, ...prev]);
    },
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { seeds, loading, error, refresh, plant };
}
