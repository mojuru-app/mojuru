import { useMediaProgress } from '@/hooks/useMediaProgress';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { MediaData } from '@/models/mediaData';
import { Plugin } from '@/models/plugins';
import { StreamingSource } from '@/models/streamingSource';
import { router } from 'expo-router';
import { SheetManager } from 'react-native-actions-sheet';

import { usePluginManager } from '../lib/plugins/usePluginManager';
import { useResolvedPlugin } from '../lib/plugins/useResolvedPlugin';

type Args = {
  media: MediaData;
  number: number;
  forcedPlugin?: Plugin;
};

export const useSearchMatchFromPluginAndPlay = (
  forcedPlugin?: Plugin,
  insidePlayer: boolean = false
) => {
  const { getMediaEpisodesProgress } = useMediaProgress();
  const { premiumFeatures } = usePremiumFeatures();
  const { plugin } = useResolvedPlugin(forcedPlugin);
  const { getEpisodeSource, searchInPlugin } = usePluginManager(plugin?.metadata.pluginProvider);

  const searchMatchFromPluginAndPlay = async ({ media, number }: Args) => {
    try {
      let providerId: string;

      // first, if media is from plugin, search directly in it
      const pluginMediaProviderId = await pickMatchDirectlyFromPlugin(media);

      // media is not from plugin
      if (pluginMediaProviderId === null) {
        // get the media id from the plugin provider
        // TODO: sposta il capire se plugin/anilist ecc fuori.
        const matchResult = (await SheetManager.show('search-in-provider-sheet', {
          payload: { media, number, forcedPlugin } as any,
        })) as { providerMediaId?: string } | undefined;

        // user manually closed the sheet
        if (!matchResult?.providerMediaId) return;

        providerId = matchResult.providerMediaId;
      } else {
        providerId = pluginMediaProviderId;
      }

      // retrieve the sources. quit if not found
      const sources = await getEpisodeSource(plugin?.metadata.name ?? null, providerId, number);
      if (sources === null || sources.length === 0) {
        // TODO: similar message will be in player.
        // since, alert doesn't work well in player,
        // change later with custom modal alert message
        throw new Error('No stream found');
      }

      const source = await pickSource(sources);
      if (source === undefined) return;

      const progresses = getMediaEpisodesProgress(`${media.provider}-${media.id}`);
      const startAt = progresses?.[number]?.progress || 0;

      router.push({
        pathname: '/player',
        params: {
          animeId: media.id,
          provider: media.provider,
          number,
          providerAnimeId: providerId,
          source: JSON.stringify(source),
          forcedPlugin: JSON.stringify(forcedPlugin),
          startAt: startAt.toString(),
          PiPEnabled: JSON.stringify(premiumFeatures),
        },
      });
    } catch (error) {
      alert((error as any)?.message || 'Unknown error');
      return;
    }
  };

  /**
   * no need to match anilist - plugin, since media is already from plugin
   */
  const pickMatchDirectlyFromPlugin = async (media: MediaData): Promise<string | null> => {
    if (media.provider === 'plugin') {
      const results = await searchInPlugin(plugin?.metadata?.name ?? null, media.title);

      if (!results) {
        return null;
      }

      return results[0].id;
      // hideWithResult(results[number - 1].id); // TODO: FIXME: tf??
    }

    return null;
  };

  /**
   * @param sources
   * @returns StreamingSource if user picks one, undefined if sheet closed manually
   */
  const pickSource = async (sources: StreamingSource[]): Promise<StreamingSource | undefined> => {
    // only one source, no need to open sheet, return it
    if (sources.length === 1) {
      return sources[0];
    }
    // more than one source, open sheet and let user pick one
    else {
      const result = (await SheetManager.show('choose-streaming-source-sheet', {
        payload: { sources, insidePlayer } as any,
      })) as { source?: StreamingSource } | undefined;

      return result?.source;
    }
  };

  return { searchMatchFromPluginAndPlay, pickSource };
};
