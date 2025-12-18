import { BORDER_RADIUS, EPISODES_PER_PAGE } from '@/constants/Utils';
import useDynColors from '@/hooks/useDynColors';
import { useMedia } from '@/hooks/useMedia';
import { useMediaProgress } from '@/hooks/useMediaProgress';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { useResolvedPlugin } from '@/lib/plugins/useResolvedPlugin';
import useTheme from '@/hooks/useTheme';
import { MediaData, MediaEpisodeCover, MediaProvider } from '@/models/mediaData';
import { getMediaDataSource } from '@/modules/mediaInfoAdapters/mediaDataFactory';
import { AniView } from '@/modules/reanimatedSingleton';
import { ChevronsUpDown } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import OptionsModal, { Options } from '../ui/OptionsModal';
import Txt from '../ui/Txt';
import MediaEpisode from './MediaEpisode';
import { Plugin } from '@/models/plugins';

/**
 * -- behavior --
 *
 * from [id] (media page), opens SearchInProviderSheet
 * from the player changes source directly
 */

const MediaEpisodesList: React.FC<{
  media?: MediaData;
  provider: MediaProvider;
  forcedPlugin?: Plugin;
  /**
   * different styles whether it's in the modal page screen or inside the player
   */
  insidePlayer?: boolean;
  onPress: (number: number) => void;
}> = ({ media, provider, forcedPlugin, insidePlayer = false, onPress }) => {
  if (!media) return null;

  const { plugin } = useResolvedPlugin(forcedPlugin);
  const { getEpisodeCount } = usePluginManager(plugin?.metadata.pluginProvider);
  const { getMediaEpisodesProgress } = useMediaProgress();
  const { dynColors } = useDynColors(media);
  const { updateMedia } = useMedia();
  const { theme } = useTheme();

  const [renderEpisodes, setRenderEpisodes] = useState<boolean>(false);
  const [showToggleEpisodesModal, setShowToggleEpisodesModal] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [episodes, setEpisodes] = useState<
    {
      number: number;
      episodeCover: MediaEpisodeCover | undefined;
    }[]
  >([]);
  const [options, setOptions] = useState<Options>([]);
  const [totalPages, setTotalPages] = useState<number>();

  const mediaDataSource = getMediaDataSource(provider);

  const visibleEpisodes = useMemo(() => {
    return episodes.slice((selectedPage - 1) * EPISODES_PER_PAGE, selectedPage * EPISODES_PER_PAGE);
  }, [episodes, selectedPage, media.episodesCovers]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      let aE = media.availableEpisodes;

      if (media.provider === 'plugin' && aE === undefined) {
        aE = (await getEpisodeCount(plugin?.metadata.name ?? null, media.id.toString())) ?? 0;
        updateMedia(provider, media.id, { availableEpisodes: aE });
      }

      if (!aE) return;

      const { episodes: e, options: p } = mediaDataSource.getMediaEpisodesAndOptions(media, aE);

      setEpisodes(e);
      setOptions(p);
      setTotalPages(Math.ceil(aE / EPISODES_PER_PAGE));
    };

    fetchEpisodes();
  }, [media.episodesCovers]);

  useEffect(() => {
    setTimeout(() => {
      setRenderEpisodes(true);
    }, 0);
  }, [episodes, options]);

  return (
    <>
      <AniView style={{ flex: insidePlayer ? undefined : 1 }}>
        {totalPages && totalPages > 1 && (
          <TouchableOpacity
            onPress={() => {
              setShowToggleEpisodesModal(true);
            }}
            activeOpacity={0.5}
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: dynColors.dark,
              borderRadius: BORDER_RADIUS,
              marginBottom: 16,
              marginRight: insidePlayer ? 16 : 0,
              padding: 8,
            }}
          >
            <Txt
              style={{
                fontFamily: 'Medium',
                color: theme.textSupporting,
                fontSize: 14,
              }}
            >
              {options.find((option) => option.value === selectedPage)?.label}
            </Txt>

            <ChevronsUpDown size={14} color={theme.textSupporting} />
          </TouchableOpacity>
        )}

        {renderEpisodes && (
          <FlatList
            horizontal={insidePlayer}
            scrollEnabled={insidePlayer}
            data={visibleEpisodes}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            renderItem={({ item, index }) => (
              <MediaEpisode
                media={media}
                number={item.number}
                banner={media.bannerImage?.extraLarge}
                coverColor={dynColors.dark}
                primaryColor={dynColors.primary}
                episodeCover={item.episodeCover}
                episodeProgress={getMediaEpisodesProgress(`${provider}-${media.id}`)?.[index + 1]}
                insidePlayer={insidePlayer}
                onPress={() => {
                  onPress(item.number);
                }}
              />
            )}
          />
        )}
      </AniView>

      <OptionsModal
        visible={showToggleEpisodesModal}
        onClose={() => {
          setShowToggleEpisodesModal(false);
        }}
        closeOnChange
        options={options}
        defaultValue={selectedPage}
        onChange={(value: any) => {
          setSelectedPage(value);
        }}
      />
    </>
  );
};

export default MediaEpisodesList;
