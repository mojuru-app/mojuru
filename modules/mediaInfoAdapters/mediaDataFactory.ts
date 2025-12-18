import { MediaDataSource, MediaProvider } from '@/models/mediaData';

import { AniListAdapter } from './aniListAdapter';
import { PluginAdapter } from './pluginAdapter';

export const getMediaDataSource = (source: MediaProvider): MediaDataSource => {
  switch (source) {
    case "anilist":
      return AniListAdapter;
    case "plugin":
      return PluginAdapter;
    default:
      throw new Error("Wrong source");
  }
};
