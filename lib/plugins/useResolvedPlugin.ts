import { useStore } from '@/hooks/useStore';
import { Plugin } from '@/models/plugins';
import { useMemo } from 'react';

export function useResolvedPlugin(forcedPlugin?: Plugin): { plugin: Plugin | null } {
  const { store } = useStore();

  const { plugin } = useMemo(() => {
    return { plugin: forcedPlugin ?? store.activePlugin ?? null };
  }, [forcedPlugin, store.activePlugin]);

  return { plugin };
}
