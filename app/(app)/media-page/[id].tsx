import { userListsAtom } from '@/atoms';
import Frame from '@/components/Frame';
import MediaContentTabs from '@/components/media/MediaContentTabs';
import { Button } from '@/components/ui/Buttons';
import Heading from '@/components/ui/Heading';
import Txt from '@/components/ui/Txt';
import { FRAME_MARGIN } from '@/constants/Utils';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import useDynColors from '@/hooks/useDynColors';
import useIsExpoGo from '@/hooks/useIsExpoGo';
import { useMedia } from '@/hooks/useMedia';
import { useMediaMatchCache } from '@/hooks/useMediaMatchCache';
import { useSearchMatchFromPluginAndPlay } from '@/hooks/useSearchMatchFromPluginAndPlay';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { useResolvedPlugin } from '@/lib/plugins/useResolvedPlugin';
import { MediaProvider } from '@/models/mediaData';
import { Plugin } from '@/models/plugins';
import { getMediaDataSource } from '@/modules/mediaInfoAdapters/mediaDataFactory';
import { addMediaToLibrary, removeMediaFromLibrary } from '@/modules/mediaSync';
import { AniTxt, AniView } from '@/modules/reanimatedSingleton';
import { getContrastYIQ } from '@/modules/utils/color';
import { hapticVibrate } from '@/modules/utils/haptics';
import {
  formatDuration,
  formatEpisodes,
  formatGenres,
  formatRating,
  formatYear,
} from '@/modules/utils/utils';
import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import {
  Bookmark,
  CalendarRange,
  CheckCheck,
  CloudOff,
  Drama,
  Film,
  LucideIcon,
  Play,
  RadioTower,
  Star,
  Timer,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import {
  Easing,
  Extrapolation,
  FadeIn,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

import MemoizedHTMLDescription from '../../../components/MemoizedHTMLDescription';

export default function MediaScreen() {
  const {
    id,
    provider,
    forcedPlugin: forcedPluginParam,
  }: Required<{ id: string; provider: string }> & {
    forcedPlugin?: string;
  } = useLocalSearchParams();

  let forcedPlugin: Plugin | undefined;
  try {
    forcedPlugin = forcedPluginParam ? JSON.parse(forcedPluginParam) : undefined;
  } catch (e) {
    console.warn('Invalid forcedPlugin JSON:', forcedPluginParam);
    forcedPlugin = undefined;
  }

  const { plugin } = useResolvedPlugin(forcedPlugin);
  const { searchMatchFromPluginAndPlay } = useSearchMatchFromPluginAndPlay(forcedPlugin);
  const { getMedia, updateMedia } = useMedia();
  const { allPlugins } = usePluginManager();
  const media = getMedia(provider, id)!;
  const [_, setUserLists] = useAtom(userListsAtom);

  const showWatchButton = useMemo(
    () =>
      allPlugins.some((p) => p.metadata.pluginType === 'provider') || forcedPlugin !== undefined,
    [allPlugins]
  );

  useEffect(() => {
    console.log(showWatchButton)
  }, [showWatchButton])

  const { hasMatchForMedia, removeMediaMatch } = useMediaMatchCache();
  const { isLoggedInWithAniList } = useAniListAuth();
  const { dynColors } = useDynColors(media);
  const isExpoGo = useIsExpoGo();
  const { theme } = useTheme();
  const { store } = useStore();

  const mediaDataSource = getMediaDataSource(provider as unknown as MediaProvider);
  const isMatched = hasMatchForMedia(media.provider, media.id.toString(), plugin);
  const hidingBouncingElementsValue = useSharedValue(1);

  const [toggleLibraryLoading, setToggleLibraryLoading] = useState<boolean>(false);
  const [isInLibrary, setIsInLibrary] = useState<boolean>(
    !!(
      media?.mediaListEntry?.status === 'PLANNING' ||
      media?.mediaListEntry?.status === 'CURRENT' ||
      media?.mediaListEntry?.status === 'REPEATING'
    )
  );
  const [isWatched, setIsWatched] = useState<boolean>(
    !!(media?.mediaListEntry?.status === 'COMPLETED')
  );
  const [playText, setPlayText] = useState<string>();
  const [episodeToPlay, setEpisodeToPlay] = useState<number>();
  const [number, setNumber] = useState<number>();

  useEffect(() => {
    const fetchCovers = async () => {
      let covers = null;

      // fetch details only if the dedicated settings is turned on. otherwise, null, which means loading defaults
      if (!store.hideDetails)
        covers = await mediaDataSource.fetchEpisodesCovers(media.episodesCoversSearchKey);

      updateMedia(provider, media.id, { episodesCovers: covers });
    };

    if (media?.episodesCovers === undefined) {
      fetchCovers();
    }
  }, []);

  // dynamically update episode to play and text to show
  useEffect(() => {
    const p = media.mediaListEntry?.progress;
    if (p === 0) {
      // start watching, but was in library
      setEpisodeToPlay(p + 1);
      setPlayText(`Start Watching - Ep.${p + 1}`);
    } else if (p === media.episodes && p !== undefined) {
      // completed => so rewatch
      setEpisodeToPlay(1);
      setPlayText('Rewatch');
    } else if (p !== undefined) {
      // continue watching
      setEpisodeToPlay(p + 1);
      setPlayText(`Continue - Ep.${p + 1}`);
    } else {
      // start watching
      setEpisodeToPlay(1);
      setPlayText('Watch Now');
    }
  }, [media.mediaListEntry]);

  const toggleLibrary = async () => {
    try {
      setToggleLibraryLoading(true);

      if (isInLibrary) {
        if (media.mediaListEntry?.status === 'PLANNING') {
          const removed = await removeMediaFromLibrary(setUserLists, media);
          if (removed) setIsInLibrary(false);
        } else {
          Alert.alert(
            'Remove Media from Library',
            'You have progress saved for this media. Removing it will erase your progress. Are you sure you want to proceed?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Remove',
                onPress: async () => {
                  const removed = await removeMediaFromLibrary(setUserLists, media);
                  if (removed) setIsInLibrary(false);
                },
                style: 'destructive',
              },
            ]
          );
        }
      } else {
        const added = await addMediaToLibrary(setUserLists, media);
        setIsInLibrary(added);
      }
    } finally {
      setToggleLibraryLoading(false);
    }
  };

  useEffect(() => {
    setIsInLibrary(
      !!(
        media?.mediaListEntry?.status === 'PLANNING' ||
        media?.mediaListEntry?.status === 'CURRENT' ||
        media?.mediaListEntry?.status === 'REPEATING'
      )
    );
  }, [media.mediaListEntry]);

  const handleEpisodePress = (number: number) => {
    setNumber(number);
    startMatching(number);
  };

  // TODO:
  const shareMedia = () => {};

  const clearMediaMatchCache = () => {
    Alert.alert(
      'Remove Matching Cache?',
      `This will forget the current plugin associations for this media. You'll need to match it again next time.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Forget',
          style: 'destructive',
          onPress: () => {
            removeMediaMatch(media.provider, media.id.toString(), plugin);
          },
        },
      ]
    );
  };

  const startMatching = async (episodeNumber: number | undefined) => {
    if (!media || episodeNumber === undefined) return;
    searchMatchFromPluginAndPlay({ media, number: episodeNumber, forcedPlugin });
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    hidingBouncingElementsValue.value = interpolate(y, [-20, -140], [1, 0], Extrapolation.CLAMP);
  };

  return (
    <AniView entering={isExpoGo ? undefined : FadeIn.duration(300).easing(Easing.ease)}>
      <Frame
        showCollapsibleHeader
        collapsibleHeaderText={media.title}
        collapsibleHeaderHeight={store.deviceHeight * 0.45}
        rightIcons={
          isMatched && store.matchCachingEnabled
            ? [
                {
                  icon: CloudOff,
                  accent: theme.text,
                  onPress: clearMediaMatchCache,
                },
              ]
            : undefined
        }
        backButton
        bouncingImage={{
          imageCover: media?.coverImage,
          imageColor: dynColors.darker,
        }}
        safeAreaProps={{ edges: ['left', 'right'] }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View
          style={{
            paddingHorizontal: FRAME_MARGIN,
            top: -20,
            marginBottom: 200,
          }}
        >
          <View style={{ gap: 15 }}>
            <AniTxt
              style={[
                {
                  fontFamily: 'Bold',
                  fontSize: 24,
                  lineHeight: 28,
                },
                { opacity: hidingBouncingElementsValue },
              ]}
            >
              {media.title}
            </AniTxt>

            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                rowGap: 5,
                columnGap: 12,
                marginTop: -6,
                marginBottom: 2,
              }}
            >
              {media.status === 'RELEASING' && (
                // <NowAiring primaryColor={dynColors.primary} darkColor={dynColors.dark} />
                <InfoItem text="Airing Now" textColor={dynColors.primary} Icon={RadioTower} />
              )}

              <InfoItem text={formatYear(media.startDate?.year)} Icon={CalendarRange} />

              {media?.format === 'MOVIE' ? (
                <InfoItem text={formatDuration(media.duration)} Icon={Timer} />
              ) : (
                <InfoItem
                  text={formatEpisodes(media.episodes, media.availableEpisodes)}
                  Icon={Film}
                />
              )}

              <InfoItem text={formatGenres(media.genres)} Icon={Drama} />

              <InfoItem text={formatRating(media.rating)} Icon={Star} />
            </View>

            {media.availableEpisodes && (
              <View style={{ width: '100%', flexDirection: 'row', gap: 10 }}>
                {showWatchButton && (
                  <View style={{ flex: 1 }}>
                    <Button
                      title={playText}
                      LeftIcon={Play}
                      bg={dynColors.primary}
                      accent={getContrastYIQ(dynColors.primary)}
                      onPress={() => {
                        setNumber(episodeToPlay);
                        startMatching(episodeToPlay);
                      }}
                    />
                  </View>
                )}

                <View style={showWatchButton ? {} : { flex: 1 }}>
                  {isLoggedInWithAniList &&
                    provider === 'anilist' &&
                    (isWatched ? (
                      <Button
                        title={!showWatchButton ? 'Media Watched' : undefined}
                        LeftIcon={CheckCheck}
                        square={showWatchButton}
                        accent={dynColors.primary}
                        bg={dynColors.dark}
                        onPress={() => {
                          hapticVibrate();
                          alert('You already watched this media');
                        }}
                      />
                    ) : (
                      <Button
                        title={
                          !showWatchButton
                            ? isInLibrary
                              ? 'Remove From Library'
                              : 'Add To Library'
                            : undefined
                        }
                        LeftIcon={Bookmark}
                        square={showWatchButton}
                        loading={toggleLibraryLoading}
                        accent={dynColors.primary}
                        bg={dynColors.dark}
                        fillIcon={isInLibrary}
                        onPress={() => {
                          hapticVibrate();
                          toggleLibrary();
                        }}
                      />
                    ))}
                </View>
              </View>
            )}

            <View style={{ gap: 30, marginTop: 10 }}>
              <View style={{ gap: 6 }}>
                <Heading text="Synopsis" />

                <MemoizedHTMLDescription
                  description={media.description}
                  width={store.deviceWidth}
                />
              </View>

              <MediaContentTabs
                media={media}
                provider={provider as unknown as MediaProvider}
                forcedPlugin={forcedPlugin}
                onEpisodePress={handleEpisodePress}
              />
            </View>
          </View>
        </View>
      </Frame>
    </AniView>
  );
}

const NowAiring: React.FC<{ primaryColor: string; darkColor: string }> = ({
  primaryColor,
  darkColor,
}) => {
  return (
    <Txt style={{ fontFamily: 'SemiBold', color: primaryColor, fontSize: 14 }}>Airing Now</Txt>
  );
};

const InfoItem: React.FC<{
  text: string;
  textColor?: string;
  Icon: LucideIcon;
}> = ({ text, textColor, Icon }) => {
  const { theme } = useTheme();

  const color = textColor ?? theme.textShy;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Icon color={color} size={14} />
      <Txt style={{ fontFamily: 'SemiBold', color: color, fontSize: 14 }}>{text}</Txt>
    </View>
  );
};
