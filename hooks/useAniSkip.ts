import { useEffect, useState } from 'react';
import { useStore } from './useStore';

type AniSkipCategory = 'op' | 'ed' | 'recap';

interface AniSkipSegment {
  category: AniSkipCategory;
  skipType: AniSkipCategory;
  interval: [number, number];
  skipId: string;
}

interface AniSkipRawSegment {
  skipType: AniSkipCategory;
  interval: {
    startTime: number;
    endTime: number;
  };
  episodeLength: number;
  skipId: string;
}

export function useAniSkip(malId?: number, episodeNumber?: number) {
  const { store } = useStore();

  const [segments, setSegments] = useState<AniSkipSegment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSegments() {
      if (!store.aniSkipEnabled || malId === undefined || episodeNumber === undefined) {
        setSegments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.aniskip.com/v2/skip-times/${malId}/${episodeNumber}?types[]=op&types[]=ed&types[]=recap&episodeLength=0`
        );

        const data = await res.json();
        const results: AniSkipRawSegment[] = data.results;

        if (!isMounted) return;

        if (Array.isArray(results)) {
          const parsed = results.map((item) => ({
            category: item.skipType,
            skipType: item.skipType,
            interval: [item.interval.startTime, item.interval.endTime] as [number, number],
            skipId: item.skipId,
          }));

          setSegments(parsed);
        } else {
          setSegments([]);
        }
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSegments();

    return () => {
      isMounted = false;
    };
  }, [store.aniSkipEnabled, malId, episodeNumber]);

  return { segments, loading, error };
}
