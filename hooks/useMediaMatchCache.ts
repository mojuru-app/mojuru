import { MediaResult, Plugin } from '@/models/plugins';
import { useMemo } from 'react';

import { useStore } from './useStore';

interface PluginMediaEntry {
  providerMediaId: string;
  mediaResult: MediaResult;
}

export const useMediaMatchCache = () => {
  const { store, setStoreItem } = useStore();

  const getMatchedMedia = (
    mediaProvider: string,
    mediaId: string,
    pluginName: string | null
  ): MediaResult | null => {
    if (!pluginName) return null;

    const key = `${mediaProvider}-${mediaId}`;
    const pluginMatches = store?.mediaPluginCache?.[key]?.[pluginName] ?? [];

    return pluginMatches.length > 0 ? pluginMatches[0].pluginMedia : null;
  };

  const setMediaMatch = async (
    mediaProvider: string,
    mediaId: string,
    pluginName: string | null,
    providerMediaId: string,
    pluginMedia: MediaResult
  ) => {
    if (!pluginName) return null;

    try {
      const key = `${mediaProvider}-${mediaId}`;
      const currentMatch = store?.mediaPluginCache ?? {};
      const mediaEntry = currentMatch[key] ?? {};
      const pluginEntries: PluginMediaEntry[] = mediaEntry[pluginName] ?? [];

      const alreadyExists = pluginEntries.some(
        (entry) => entry.providerMediaId === providerMediaId
      );
      if (alreadyExists) return;

      const updatedPluginEntries = [...pluginEntries, { providerMediaId, pluginMedia }];

      const updatedMediaEntry = {
        ...mediaEntry,
        [pluginName]: updatedPluginEntries,
      };

      const updatedMatch = {
        ...currentMatch,
        [key]: updatedMediaEntry,
      };

      setStoreItem('mediaPluginCache', updatedMatch);
    } catch (error) {
      console.error('Error setting media match:', error);
    }
  };

  const hasMatchForMedia = (
    mediaProvider: string,
    mediaId: string,
    plugin: Plugin | null
  ): boolean => {
    if (!plugin) return false;

    const pluginName = plugin.metadata.name;

    const key = `${mediaProvider}-${mediaId}`;

    return useMemo(() => {
      const mediaMatches = store?.mediaPluginCache?.[key];
      return !!mediaMatches?.[pluginName] && mediaMatches[pluginName].length > 0;
    }, [store?.mediaPluginCache, mediaProvider, mediaId, pluginName]);
  };

  const removeMediaMatch = async (
    mediaProvider: string,
    mediaId: string,
    plugin: Plugin | null
  ) => {
    if (!plugin) return;

    const pluginName = plugin.metadata.name;

    try {
      const key = `${mediaProvider}-${mediaId}`;
      const currentMatch = store?.mediaPluginCache ?? {};
      if (!(key in currentMatch)) return;

      const updatedMatch = { ...currentMatch };
      const pluginMatches = { ...updatedMatch[key] };

      delete pluginMatches[pluginName];

      if (Object.keys(pluginMatches).length === 0) {
        delete updatedMatch[key];
      } else {
        updatedMatch[key] = pluginMatches;
      }

      await setStoreItem('mediaPluginCache', updatedMatch);
    } catch (error) {
      console.error('Error removing plugin match for media:', error);
    }
  };

  const clearAllMediaMatches = async () => {
    try {
      await setStoreItem('mediaPluginCache', {});
    } catch (error) {
      console.error('Error clearing all media matches:', error);
    }
  };

  return {
    getMatchedMedia,
    setMediaMatch,
    hasMatchForMedia,
    removeMediaMatch,
    clearAllMediaMatches,
  };
};
