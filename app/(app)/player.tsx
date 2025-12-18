import { userListsAtom } from '@/atoms';
import { AniSkipControls } from '@/components/AniSkipControls';
import MediaEpisodesList from '@/components/media/MediaEpisodesList';
import SubtitlesOverlay from '@/components/SubtitlesOverlay';
import { Button, IconCircleButton, PlayerButton } from '@/components/ui/Buttons';
import ModalBlurWrapper from '@/components/ui/ModalBlurWrapper';
import OptionsModal from '@/components/ui/OptionsModal';
import Txt from '@/components/ui/Txt';
import { MOCK_STREAMING_SOURCES } from '@/constants/Mocks';
import {
  FADE_ENTERING,
  FADE_EXITING,
  SLIDE_ENTERING,
  SLIDE_EXITING,
} from '@/constants/PlayerAnimations';
import { BORDER_RADIUS, FRAME_MARGIN } from '@/constants/Utils';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import useDynColors from '@/hooks/useDynColors';
import useIsExpoGo from '@/hooks/useIsExpoGo';
import { useMedia } from '@/hooks/useMedia';
import { useMediaProgress } from '@/hooks/useMediaProgress';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useResolvedPlugin } from '@/lib/plugins/useResolvedPlugin';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useSearchMatchFromPluginAndPlay } from '@/hooks/useSearchMatchFromPluginAndPlay';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { MediaProvider } from '@/models/mediaData';
import { QualityStream, StreamingSource, SubtitleTrack } from '@/models/streamingSource';
import { parseInsidePlayerTitle } from '@/modules/anizip';
import { markAnimeAsWatchingOrRewatching, updateAnimeProgress } from '@/modules/mediaSync';
import { AniLinearGradient, AniView } from '@/modules/reanimatedSingleton';
import { hapticVibrate, hapticVibrateSoft } from '@/modules/utils/haptics';
import { parseTime, timeToSeconds } from '@/modules/utils/time';
import { useEvent, useEventListener } from 'expo';
import * as Brightness from 'expo-brightness';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoContentFit, VideoView } from 'expo-video';
import { useAtom } from 'jotai';
import {
  ArrowLeft,
  ChevronsLeft,
  ChevronsRight,
  Crop,
  Gauge,
  Icon,
  ListVideo,
  Lock,
  LockOpen,
  LucideIcon,
  MonitorCog,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Subtitles,
  Sun,
  SunDim,
  Volume,
  Volume1,
  Volume2,
  VolumeOff,
  X,
} from 'lucide-react-native';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  DimensionValue,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SheetManager, SheetProvider } from 'react-native-actions-sheet';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIndicator } from 'react-native-indicators';
import {
  clamp,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as SubtitlesParserVTT from 'subtitles-parser-vtt';

const Controls = AniView;
const TopControls = AniView;
const MidControls = AniView;
const BottomControls = AniView;
const Timeline = GestureHandlerRootView;

const iconsGap = 5;
// const trackballSize = 13;
const panHeight = 120;

const PlayerScreen: React.FC = () => {
  const {
    animeId,
    provider,
    number,
    providerAnimeId,
    source: sourceParam,
    startAt: startAtParam,
    PiPEnabled: PiPEnabledParam,
    forcedPlugin: forcedPluginParam,
  }: Required<{
    animeId: string;
    provider: string;
    number: string;
    providerAnimeId: string;
    source: string;
    startAt: string;
    PiPEnabled: string;
  }> & {
    forcedPlugin?: string;
  } = useLocalSearchParams();

  let forcedPlugin;
  try {
    forcedPlugin = forcedPluginParam ? JSON.parse(forcedPluginParam) : undefined;
  } catch (e) {
    console.warn('Invalid forcedPlugin JSON:', forcedPluginParam);
    forcedPlugin = undefined;
  }

  const { store, setStoreItem } = useStore();
  const { plugin } = useResolvedPlugin(forcedPlugin);
  const { getEpisodeSource } = usePluginManager(plugin?.metadata.pluginProvider);
  const { setMediaEpisodeProgress } = useMediaProgress();
  const { largerSize, smallerSize } = useScreenSize();
  const { isLoggedInWithAniList } = useAniListAuth();
  const { premiumFeatures } = usePremiumFeatures();
  const { pickSource } = useSearchMatchFromPluginAndPlay(undefined, true);
  const isExpoGo = useIsExpoGo();
  const { theme } = useTheme();

  // media and episode info
  const { getMedia } = useMedia();
  const media = getMedia(provider, animeId)!;
  const { dynColors } = useDynColors(media);
  const [episodeNumber, setEpisodeNumber] = useState<number>(Number(number));
  const [_, setUserLists] = useAtom(userListsAtom);

  // anilist
  const [progressUpdated, setProgressUpdated] = useState(false);

  // general
  const ref = useRef<VideoView | null>(null);
  const [sources, setSources] = useState<StreamingSource>();
  const [activeSource, setActiveSource] = useState<QualityStream | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<SubtitleTrack | null>(null);
  // const [metadata, setMetadata] = useState<VideoMetadata>();
  // const [headers, setHeaders] = useState<Record<string, string>>();

  const [title, setTitle] = useState<string>();
  const [episodeTitle, setEpisodeTitle] = useState<string>();
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [isLoadingSource, setIsLoadingSource] = useState<boolean>(false);

  // modals and settings
  const [isInPiP, setIsInPiP] = useState<boolean>(false);
  const [showEpisodesListModal, setShowEpisodesListModal] = useState<boolean>(false);
  const [showPlaybackRateModal, setShowPlaybackRateModal] = useState<boolean>(false);
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState<boolean>(false);
  const [lockEnabled, setLockEnabled] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [resizeMode, setResizeMode] = useState<VideoContentFit>('contain');
  const [showNextEpisodeButton, setShowNextEpisodeButton] = useState<boolean>(true);
  const [showPreviousEpisodeButton, setShowPreviousEpisodeButton] = useState<boolean>(true);

  // timeline
  const [expectedCurrentTime, setExpectedCurrentTime] = useState<number>(0); // a currentTime which doesn't depend directly on the player
  const [isDraggingTimeline, setIsDraggingTimeline] = useState<boolean>(false);
  const [timelineBarWidth, setTimelineBarWidth] = useState<number>(0);
  const timelineCurrentWidth = useSharedValue(0);
  const prevTimelineCurrentWidth = useSharedValue(0);
  const [parsedDuration, setParsedDuration] = useState<string>('--:--');
  const [parsedCurrentTime, setParsedCurrentTime] = useState<string>('--:--');

  // skip buttons
  const [isLeftSpamming, setIsLeftSpamming] = useState(false);
  const [isRightSpamming, setIsRightSpamming] = useState(false);

  // const autoPiP = useRef(store.autoPiP as boolean).current;
  const isAnySpamming = isLeftSpamming || isRightSpamming;
  const PiPEnabled = JSON.parse(PiPEnabledParam) as boolean;
  const startAt = Number(startAtParam);
  const seasonNumber = 1;

  const [hasOpenedPlayer, setHasOpenedPlayer] = useState(false);

  // --- STYLES ---
  const absoluteFill = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: largerSize,
    height: smallerSize,
  } as any;
  const s = StyleSheet.create({
    centered: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  // go landscape
  useEffect(() => {
    ScreenOrientation.lockAsync(store.defaultOrientation);
  }, []);

  const trackballStyles = useAnimatedStyle(() => ({
    left: timelineCurrentWidth.value - 6,
  }));

  const timelineCurrentStyles = useAnimatedStyle(() => ({
    width: timelineCurrentWidth.value as unknown as DimensionValue,
  }));

  const player = useVideoPlayer(
    {
      uri: undefined,
      metadata: undefined,
      headers: undefined,
    },
    // very precarious zone
    (p) => {
      // p.currentTime = startAt; // not working cause dynamic source loading
      p.currentTime = 0;
      p.bufferOptions = {
        waitsToMinimizeStalling: false,
        // minBufferForPlayback: 0 // test for android
      };
      p.loop = false;
      p.staysActiveInBackground = true;
      p.showNowPlayingNotification = true;
      p.timeUpdateEventInterval = 0.1;

      if (store.volume && store.playbackRate) {
        p.volume = store.volume;
        p.playbackRate = store.playbackRate;
      } else {
        p.volume = 1;
        p.playbackRate = 1;
      }
    }
  );

  // --- PLAYER EVENTS ---
  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  const { volume } = useEvent(player, 'volumeChange', {
    volume: player.volume,
  });

  const { currentTime } = useEvent(player, 'timeUpdate', {
    bufferedPosition: player.bufferedPosition,
    currentLiveTimestamp: player.currentLiveTimestamp,
    currentOffsetFromLive: player.currentOffsetFromLive,
    currentTime: player.currentTime,
  });

  // resume episode and save when player has opened
  useEventListener(player, 'sourceChange', () => {
    // don't print here, it breaks the code
    // console.log(`Resumed media at ${startAt.toString()}`);

    if (!hasOpenedPlayer) changePosition(startAt);
    setHasOpenedPlayer(true);
  });

  const loadSource = async (
    episodeNumber: number | string,
    preloadedSource?: StreamingSource
  ): Promise<boolean> => {
    try {
      let source: StreamingSource | undefined;

      if (preloadedSource === undefined) {
        const newSources = await getEpisodeSource(
          plugin?.metadata?.name ?? null,
          providerAnimeId,
          Number(episodeNumber)
        );

        if (!newSources || newSources.length === 0) {
          throw new Error('NO_STREAM');
        }

        source = await pickSource(newSources);

        if (source === undefined) return false;
      } else {
        source = preloadedSource;
      }

      const bestQuality = getBestQuality(source.qualities);
      const pt = parseInsidePlayerTitle(
        media.episodesCovers?.[seasonNumber]?.[episodeNumber],
        episodeNumber
      );
      const gt = media.title;

      setSources(source);
      setActiveSource(bestQuality);
      setActiveSubtitle(source?.subtitles?.[0] ?? null);
      setTitle(gt);
      setEpisodeTitle(pt);

      await player.replaceAsync({
        uri: bestQuality.url,
        metadata: {
          artist: gt,
          artwork: media.coverImage?.medium ?? media.coverImage?.large,
          title: pt,
        },
        headers: bestQuality.headers,
      });

      return true;
    } catch (error: any) {
      if (error?.message === 'NO_STREAM') {
        alert('No streams available for this episode.');
      } else {
        alert('Errore loading stream.');
        console.error(error);
      }
      return false;
    }
  };

  // load the source when the player opens
  useEffect(() => {
    const loadFirstSource = async () => {
      const firstSource = JSON.parse(sourceParam) as StreamingSource;

      try {
        const loaded = await loadSource(number, firstSource);
        if (!loaded) return;

        if (isLoggedInWithAniList && store.anilistSyncEnabled && provider === 'anilist') {
          await markAnimeAsWatchingOrRewatching(media, setUserLists);
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : String(error));
        console.error(error);
        closePlayer();
      } finally {
        setIsLoadingSource(false);
      }
    };

    loadFirstSource();
  }, []);

  const changeEpisode = async (newNumber: number) => {
    try {
      if (newNumber == episodeNumber) return;

      isPlaying && player.pause();

      // reset stuff and prepare new episode number
      setShowEpisodesListModal(false);
      setSources(undefined);

      const loaded = await loadSource(newNumber);
      if (!loaded) return;

      setEpisodeNumber(newNumber);

      // be able to update the progress on the new episode too
      setProgressUpdated(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
      console.error(error);
      closePlayer();
    } finally {
      setIsLoadingSource(false);
    }
  };

  // clean controls timeout when quitting
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, []);

  // update parsed currentTime
  useEffect(() => {
    const newCurrentTime = parseTime(currentTime);
    if (!isDraggingTimeline) {
      setParsedCurrentTime(newCurrentTime);
    }
  }, [currentTime]);

  const updateSecondsProgress = (seconds?: number) => {
    // update only each x seconds
    if (seconds && Math.floor(player.currentTime) % seconds !== 0) return;

    setMediaEpisodeProgress(`${provider}-${media.id}`, episodeNumber, player.currentTime, duration);
  };

  // update episode progress
  useEffect(() => {
    const checkUpdateProgress = () => {
      if (!store.episodeProgressThreshold || !duration) return;

      const progressPercentage = (currentTime / duration) * 100;

      if (progressPercentage >= store.episodeProgressThreshold && !progressUpdated) {
        updateAnimeProgress(media, setUserLists, Number(episodeNumber));
        setProgressUpdated(true);
      }
    };

    if (duration !== 0) updateSecondsProgress(20);
    if (isLoggedInWithAniList && store.anilistSyncEnabled && provider === 'anilist')
      checkUpdateProgress();
  }, [currentTime]);

  // set duration
  useEffect(() => {
    setDuration(player.duration);
    setParsedDuration(parseTime(player.duration));
  }, [status]);

  // show/hide previous & next episode buttons
  useEffect(() => {
    setShowPreviousEpisodeButton(episodeNumber !== 1);
    setShowNextEpisodeButton(episodeNumber !== media.availableEpisodes);
  }, [episodeNumber]);

  // don't hide controls while modals are open
  useEffect(() => {
    const isAnyModalOpenOrSpamming = isAnyModalOpen() || isAnySpamming;

    if (!isDraggingTimeline && !isAnyModalOpenOrSpamming) {
      resetHideControlsTimer();
    } else {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
        hideControlsTimeout.current = null;
      }
    }
  }, [
    isDraggingTimeline,
    showEpisodesListModal,
    showQualityModal,
    showSubtitlesModal,
    showPlaybackRateModal,
    isAnySpamming,
  ]);

  // toggle video playing on modal open/close
  useEffect(() => {
    if (!store.pauseDuringInteractions) return;

    if (isAnyModalOpen()) {
      player.pause();
    } else {
      player.play();
    }
  }, [showEpisodesListModal, showQualityModal, showSubtitlesModal, showPlaybackRateModal]);

  useEffect(() => {
    if (status === 'readyToPlay') player.play();
  }, [status]);

  useEffect(() => {
    setLoading(status === 'loading' || isLoadingSource);
  }, [status, isLoadingSource]);

  // controls and skip buttons visibility
  useEffect(() => {
    setShowControls(!isLoadingSource && controlsVisible && duration !== 0);
  }, [isLoadingSource, controlsVisible, duration]);

  const getBestQuality = (sources: QualityStream[]) => {
    const storedQualityUrl = sources.find((s) => s.quality === store.quality);
    if (storedQualityUrl !== undefined) return storedQualityUrl;

    const defaultQualityUrl = sources.find((s) => s.quality === 'default');
    if (defaultQualityUrl !== undefined) return defaultQualityUrl;

    const SUBQualityUrl = sources.find((s) => s.quality === 'SUB');
    if (SUBQualityUrl !== undefined) return SUBQualityUrl;

    return sources[0];
  };

  // --- TOGGLES + UTILS ---
  const closePlayer = async () => {
    if (duration !== 0) updateSecondsProgress();
    isPlaying && player.pause();
    await rememberSettings();

    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    router.back();
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const playWhenReady = () => {
    const interval = setInterval(() => {
      if (status === 'readyToPlay') {
        player.play();
        clearInterval(interval);
      }
    }, 200);
  };

  // from 30 with 10 passed, becomes 10
  const changePosition = async (position: number) => {
    try {
      player.currentTime = position;
      setExpectedCurrentTime(position);
      setTimeout(() => {
        player.play();
        handleHeavyButtonTap();
      }, 100);
    } catch (error) {
      console.error('error changing video position');
    }
  };

  // from 30 with +-10 passed, becomes +-40
  const changePositionBias = async (bias = 0) => {
    try {
      player.seekBy(bias);
      setExpectedCurrentTime(player.currentTime);
      setTimeout(() => {
        player.play();
        handleHeavyButtonTap();
      }, 100);
    } catch (error) {
      console.error('error changing video position');
    }
  };

  const togglePiP = async (enable: boolean) => {
    if (enable) {
      ref.current?.startPictureInPicture();
    } else {
      ref.current?.stopPictureInPicture();
    }

    setIsInPiP(enable);
  };

  const toggleResizeMode = () => {
    switch (resizeMode) {
      case 'contain':
        setResizeMode('cover');
        break;
      case 'cover':
        setResizeMode('fill');
        break;
      case 'fill':
      default:
        setResizeMode('contain');
        break;
    }
  };

  // --- TIMELINE ---
  const startTimelineDragging = () => {
    setIsDraggingTimeline(true);
    resetHideControlsTimer(true);
    prevTimelineCurrentWidth.value =
      ((loading ? expectedCurrentTime : currentTime) / duration) * timelineBarWidth;
    player.pause();
  };

  const whileTimelineDragging = (event: { translationX: number }) => {
    timelineCurrentWidth.value = clamp(
      prevTimelineCurrentWidth.value + event.translationX,
      0,
      timelineBarWidth
    );

    const newCurrentTime = (timelineCurrentWidth.value / timelineBarWidth) * duration;

    setExpectedCurrentTime(newCurrentTime);
    setParsedCurrentTime(parseTime(newCurrentTime));
  };

  const stopTimelineDragging = async () => {
    setIsDraggingTimeline(false);
    resetHideControlsTimer();
    hapticVibrateSoft();

    changePosition((timelineCurrentWidth.value / timelineBarWidth) * duration).then(playWhenReady);
  };

  const timelinePan = Gesture.Pan()
    .minDistance(0)
    .onTouchesDown(startTimelineDragging)
    .onUpdate(whileTimelineDragging)
    .onTouchesUp(stopTimelineDragging)
    .onEnd(stopTimelineDragging)
    .runOnJS(true);

  const trackballSizeMin = 12;
  const trackballSizeMax = 18;
  const trackballSize = useMemo(
    () => (isDraggingTimeline ? trackballSizeMax : trackballSizeMin),
    [isDraggingTimeline]
  );

  const timeline = useMemo(() => {
    const p = (currentTime / duration) * 100;

    return (
      <Timeline>
        <GestureDetector gesture={timelinePan}>
          <View
            style={{
              width: '100%',
              margin: 'auto',
              height: 35,
              top: -9,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: BORDER_RADIUS,
            }}
            onLayout={(event) => setTimelineBarWidth(event.nativeEvent.layout.width)}
          >
            <AniView
              style={[
                trackballStyles,
                {
                  position: 'absolute',
                  left: `${p}%`,
                  width: trackballSize,
                  height: trackballSize,
                  backgroundColor: dynColors.primary,
                  marginLeft: isDraggingTimeline ? -((trackballSizeMax - trackballSizeMin) / 2) : 0,
                  zIndex: 3,
                  borderRadius: 9999,
                },
              ]}
            />
            <View
              style={{
                width: '100%',
                height: 5,
                backgroundColor: '#aeaeae70',
                borderRadius: BORDER_RADIUS,
                overflow: 'hidden',
              }}
            >
              <AniView
                style={[
                  timelineCurrentStyles,
                  {
                    width: `${p}%`,
                    height: '100%',
                    backgroundColor: dynColors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </Timeline>
    );
  }, [
    currentTime,
    duration,
    dynColors.primary,
    timelinePan,
    trackballSize,
    trackballStyles,
    timelineCurrentStyles,
    player.currentTime,
  ]);

  const rememberSettings = async () => {
    await setStoreItem('volume', player.volume);
    // await setStoreItem('brightness', brightness);
    await setStoreItem('playbackRate', player.playbackRate);

    // yaaaaaaawn ;O
    // await setStoreItem("quality", )
  };

  const resetHideControlsTimer = (draggingTimeline?: boolean) => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = null;
    }

    if (!draggingTimeline && !isAnyModalOpen()) {
      hideControlsTimeout.current = setTimeout(() => {
        runOnJS(setControlsVisible)(false);
      }, 3500);
    }
  };

  const isAnyModalOpen = () => {
    return showEpisodesListModal || showQualityModal || showSubtitlesModal || showPlaybackRateModal;
  };

  const handleScreenTap = (state?: boolean) => {
    setControlsVisible((prevVisible) => {
      const newState = state !== undefined ? state : !prevVisible;
      if (newState) {
        resetHideControlsTimer();
      } else if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
        hideControlsTimeout.current = null;
      }
      return newState;
    });
  };

  const handleHeavyButtonTap = () => {
    handleScreenTap(true);
    // hapticVibratePlayer();
  };

  const [startPosition, setStartPosition] = useState({
    x: 0,
    y: 0,
  });

  // tap checking to avoid showing controls when using magic sliders
  const handleTouchStart = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    setStartPosition({
      x: pageX,
      y: pageY,
    });
  };

  const handleTouchEnd = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    const distance = Math.sqrt(
      Math.pow(pageX - startPosition.x, 2) + Math.pow(pageY - startPosition.y, 2)
    );

    const tapThreshold = 5;
    if (distance < tapThreshold && !isDraggingTimeline) {
      handleScreenTap();
    }
  };

  const changeQuality = (url: string | number) => {
    try {
      const selected = sources?.qualities?.find((s) => s.url === url) || null;
      setActiveSource(selected);

      // need to change source directly in player
      player.replaceAsync({
        uri: String(url),
        // keep same metadata since we are not changing episode
        metadata: {
          artist: title,
          artwork: media.coverImage?.medium ?? media.coverImage?.large,
          title: episodeTitle,
        },
        headers: selected?.headers,
      });
    } catch (error) {
      alert('Error while changing quality');
      console.error(error);
    }
  };

  const changeSubtitle = (url: string | number) => {
    try {
      const selected = sources?.subtitles?.find((s) => s.url === url) || null;
      setActiveSubtitle(selected);

      // NO NEED to change subtitle somewhere: already handled by SubtitleViewer
    } catch (error) {
      alert('Error while changing subtitles');
      console.error(error);
    }
  };

  return (
    <SheetProvider>
      <>
        <TouchableWithoutFeedback
          onPressIn={handleTouchStart}
          onPressOut={handleTouchEnd}
          style={{
            ...absoluteFill,
          }}
        >
          <View
            style={{
              ...absoluteFill,
              flex: 1,
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <VideoView
              ref={ref}
              style={{
                width: largerSize,
                height: smallerSize,
                zIndex: -1,
              }}
              player={player}
              allowsFullscreen
              allowsPictureInPicture={PiPEnabled}
              startsPictureInPictureAutomatically
              onPictureInPictureStart={() => setIsInPiP(true)}
              onPictureInPictureStop={() => setIsInPiP(false)}
              contentFit={resizeMode}
              nativeControls={false}
              // nativeControls={store.useNativeControls as boolean}
            />

            {activeSubtitle && (
              <SubtitleViewer subtitle={activeSubtitle} currentTime={currentTime} />
            )}

            {loading && (
              <>
                {isLoadingSource && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 15,
                      right: 15,
                      zIndex: 101, // gotta stay higher than loading
                      justifyContent: 'center',
                    }}
                  >
                    <IconCircleButton Icon={X} largerTouchArea sizeBias={4} onPress={closePlayer} />
                  </View>
                )}
                <MaterialIndicator
                  color="white"
                  size={70}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    pointerEvents: 'box-none',
                    zIndex: 10,
                    transform: [
                      {
                        translateY: '-50%',
                      },
                      {
                        translateX: '-50%',
                      },
                    ],
                  }}
                />
              </>
            )}

            {showControls && (
              <Controls
                entering={isExpoGo ? undefined : FADE_ENTERING}
                exiting={FADE_EXITING}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  paddingHorizontal: FRAME_MARGIN * 2,
                  paddingVertical: FRAME_MARGIN / 2,
                }}
              >
                <Gradient light={lockEnabled} />

                {lockEnabled && (
                  <AniView
                    entering={isExpoGo ? undefined : FADE_ENTERING}
                    exiting={FADE_EXITING}
                    style={{
                      position: 'absolute',
                      left: largerSize / 2,
                      transform: [
                        {
                          translateX: '-50%',
                        },
                      ],
                      zIndex: 2,
                      top: FRAME_MARGIN,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onLongPress={() => {
                        setLockEnabled(false);
                        hapticVibrate();
                        handleScreenTap(true);
                      }}
                      style={{ flexDirection: 'column', alignItems: 'center', gap: 4 }}
                    >
                      <LockOpen strokeWidth={2} size={25} color={theme.text} />
                      <Txt style={{ fontFamily: 'Bold', fontSize: 12 }}>Hold to unlock</Txt>
                    </TouchableOpacity>
                  </AniView>
                )}

                {!lockEnabled && (
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'column',
                      height: '100%',
                      width: '100%',
                    }}
                  >
                    <TopControls
                      entering={isExpoGo ? undefined : FADE_ENTERING}
                      exiting={FADE_EXITING}
                      style={[
                        {
                          width: '100%',
                          flexDirection: 'column',
                        },
                      ]}
                    >
                      <View
                        style={[
                          {
                            justifyContent: 'space-between',
                          },
                          s.centered,
                        ]}
                      >
                        <View
                          style={[
                            {
                              gap: iconsGap,
                            },
                            s.centered,
                          ]}
                        >
                          <PlayerButton
                            Icon={ArrowLeft}
                            onPress={() => {
                              closePlayer();
                              handleHeavyButtonTap();
                            }}
                          />

                          <View
                            style={{
                              flexDirection: 'column',
                              gap: 2,
                              // position: 'absolute',
                              // marginLeft: 45,
                              marginTop: 11,
                              width: '100%',
                              maxWidth: '75%',
                            }}
                          >
                            <Txt
                              style={{
                                fontFamily: 'SemiBold',
                                fontSize: 17,
                                color: theme.text,
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {episodeTitle}
                            </Txt>

                            <Txt
                              style={{
                                // position: "absolute",
                                // top: 25,
                                // left: 0,
                                fontFamily: 'Medium',
                                fontSize: 13,
                                color: theme.textSupporting,
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {title}
                            </Txt>
                          </View>
                        </View>

                        <View
                          style={[
                            {
                              gap: iconsGap,
                            },
                            s.centered,
                          ]}
                        >
                          <PlayerButton
                            Icon={PictureInPicture2}
                            onPress={() => {
                              togglePiP(!isInPiP);
                              handleHeavyButtonTap();
                            }}
                            disabled={!premiumFeatures}
                          />
                          <PlayerButton
                            Icon={Lock}
                            onPress={() => {
                              setLockEnabled(true);
                              handleHeavyButtonTap();
                            }}
                          />
                        </View>
                      </View>
                    </TopControls>

                    <MidControls
                      entering={isExpoGo ? undefined : FADE_ENTERING}
                      exiting={FADE_EXITING}
                      style={[
                        {
                          position: 'absolute',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: 400,
                          height: 100,
                          top: '50%',
                          left: '50%',
                          transform: [
                            {
                              translateY: -50,
                            },
                            {
                              translateX: -200,
                            },
                          ],
                        },
                        s.centered,
                      ]}
                    >
                      <MagicSkipButton
                        orientation="left"
                        onSkip={(skipAmount: number) => {
                          changePositionBias(skipAmount);
                        }}
                        onSpammingChange={setIsLeftSpamming}
                      />
                      <View>
                        <PlayerButton
                          Icon={isPlaying ? Pause : Play}
                          fillIcon
                          sizeBias={30}
                          onPress={() => {
                            togglePlayPause();
                            handleHeavyButtonTap();
                          }}
                        />
                      </View>
                      <MagicSkipButton
                        orientation="right"
                        onSkip={(skipAmount: number) => {
                          changePositionBias(skipAmount);
                        }}
                        onSpammingChange={setIsRightSpamming}
                      />
                    </MidControls>
                    <BottomControls
                      entering={
                        isExpoGo
                          ? undefined
                          : store.timelineAnimation === 'fade'
                          ? FADE_ENTERING
                          : SLIDE_ENTERING
                      }
                      exiting={store.timelineAnimation === 'fade' ? FADE_EXITING : SLIDE_EXITING}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'space-between',
                          // backgroundColor: "#e9120031",
                          marginBottom: 3,
                        }}
                      >
                        <Txt
                          style={{
                            fontFamily: 'Medium',
                            color: theme.text,
                            fontSize: 14,
                          }}
                        >
                          {parsedCurrentTime}
                        </Txt>
                        <Txt
                          style={{
                            fontFamily: 'Medium',
                            color: theme.text,
                            fontSize: 14,
                          }}
                        >
                          {parsedDuration}
                        </Txt>
                      </View>
                      {timeline}

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 20,
                        }}
                      >
                        <View
                          style={[
                            {
                              gap: iconsGap,
                            },
                            s.centered,
                          ]}
                        >
                          <PlayerButton
                            Icon={ListVideo}
                            onPress={() => {
                              setShowEpisodesListModal(true);
                              handleHeavyButtonTap();
                            }}
                            disabled={media.availableEpisodes === 1}
                          />

                          <PlayerButton
                            Icon={ChevronsLeft}
                            onPress={() => {
                              changeEpisode(episodeNumber - 1);
                              handleHeavyButtonTap();
                            }}
                            disabled={!showPreviousEpisodeButton}
                          />

                          <PlayerButton
                            Icon={ChevronsRight}
                            onPress={() => {
                              changeEpisode(episodeNumber + 1);
                              handleHeavyButtonTap();
                            }}
                            disabled={!showNextEpisodeButton}
                          />
                        </View>

                        <View
                          style={[
                            {
                              gap: iconsGap,
                            },
                            s.centered,
                          ]}
                        >
                          <PlayerButton
                            Icon={MonitorCog}
                            onPress={() => {
                              setShowQualityModal(true);
                              handleHeavyButtonTap();
                            }}
                            disabled={!sources?.qualities || sources.qualities.length === 1}
                          />
                          <PlayerButton
                            Icon={Subtitles}
                            onPress={() => {
                              setShowSubtitlesModal(true);
                              handleHeavyButtonTap();
                            }}
                            disabled={!sources?.subtitles || sources.subtitles.length === 0}
                          />
                          <PlayerButton
                            Icon={Gauge}
                            onPress={() => {
                              setShowPlaybackRateModal(true);
                              handleHeavyButtonTap();
                            }}
                          />
                          <PlayerButton
                            Icon={Crop}
                            onPress={() => {
                              toggleResizeMode();
                              handleHeavyButtonTap();
                            }}
                            key={resizeMode}
                          />
                        </View>
                      </View>
                    </BottomControls>
                  </View>
                )}
              </Controls>
            )}
            {store.magicSlidersEnabled && !lockEnabled && (
              <MagicSliders
                volume={volume}
                setVolume={(value: number) => (player.volume = value)}
                controlsVisible={false}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        {!lockEnabled && (
          <AniSkipControls
            malId={media.idMal}
            episodeNumber={episodeNumber}
            currentTime={currentTime}
            showDefault={showControls}
            onSkip={(time) => {
              changePosition(time);
            }}
            onNextEpisode={() => {
              changeEpisode(episodeNumber + 1);
            }}
          />
        )}

        <ModalBlurWrapper
          visible={showEpisodesListModal}
          onClose={() => {
            setShowEpisodesListModal(false);
          }}
        >
          <View
            style={{
              flex: 1,
              position: 'relative',
              justifyContent: 'center',
              paddingHorizontal: FRAME_MARGIN * 2,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                zIndex: 100,
                justifyContent: 'center',
              }}
            >
              <IconCircleButton
                Icon={X}
                largerTouchArea
                sizeBias={12}
                onPress={() => {
                  setShowEpisodesListModal(false);
                }}
              />
            </View>
            <MediaEpisodesList
              insidePlayer
              media={media}
              provider={provider as unknown as MediaProvider}
              onPress={changeEpisode}
            />
          </View>
        </ModalBlurWrapper>

        {sources?.qualities && (
          <OptionsModal
            visible={showQualityModal}
            closeOnChange
            onClose={() => {
              setShowQualityModal(false);
            }}
            options={sources.qualities.map((s) => ({
              label: s.quality!,
              value: s.url!,
            }))}
            defaultValue={activeSource?.url ?? ''}
            onChange={changeQuality}
          />
        )}

        {sources?.subtitles && (
          <OptionsModal
            visible={showSubtitlesModal}
            onClose={() => {
              setShowSubtitlesModal(false);
            }}
            options={[
              { label: 'Off', value: '' },
              ...sources.subtitles.map((s) => ({ label: s.label, value: s.url })),
            ]}
            defaultValue={activeSubtitle?.url ?? ''}
            onChange={changeSubtitle}
          />
        )}

        <OptionsModal
          visible={showPlaybackRateModal}
          closeOnChange
          onClose={() => {
            setShowPlaybackRateModal(false);
          }}
          options={[
            {
              label: '0.5x',
              value: 0.5,
            },
            {
              label: '1x',
              value: 1,
            },
            {
              label: '1.25x',
              value: 1.25,
            },
            {
              label: '1.5x',
              value: 1.5,
            },
            {
              label: '2x',
              value: 2,
            },
          ]}
          defaultValue={player.playbackRate}
          onChange={(value: any) => {
            player.playbackRate = value;
          }}
        />
      </>
    </SheetProvider>
  );
};

export default PlayerScreen;

const Gradient: React.FC<{
  light?: boolean;
}> = memo(
  ({ light = false }) => {
    const isExpoGo = useIsExpoGo();

    const value = light ? 0.6 : 0.8;

    return (
      <AniLinearGradient
        entering={isExpoGo ? undefined : FADE_ENTERING}
        exiting={FADE_EXITING}
        colors={[
          `rgba(0, 0, 0, ${value})`,
          `rgba(0, 0, 0, ${value / 2})`,
          `rgba(0, 0, 0, ${value / 2})`,
          `rgba(0, 0, 0, ${value})`,
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 0,
          y: 1,
        }}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.light === nextProps.light;
  }
);

const MagicSkipButton: React.FC<{
  orientation: 'left' | 'right';
  onSkip: (skipAmount: number) => void;
  onSpammingChange?: (isSpamming: boolean) => void;
}> = ({ orientation, onSkip, onSpammingChange }) => {
  const [totalSkipped, setTotalSkipped] = useState(0);
  const [spamming, setSpamming] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = useSharedValue(0);
  const size = useSharedValue(1);

  const defaultSkip = 10;
  const isLeft = orientation === 'left';

  const totalSkippedRef = useRef(0);

  const handlePress = () => {
    const skipAmount = defaultSkip;
    setTotalSkipped((prev) => {
      const next = prev + skipAmount;
      totalSkippedRef.current = next;
      return next;
    });

    if (!spamming) {
      setSpamming(true);
      onSpammingChange?.(true);
      progress.value = withTiming(1, { duration: 0, easing: Easing.linear });
      size.value = withTiming(2, { duration: 100, easing: Easing.linear });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSkip(isLeft ? -totalSkippedRef.current : totalSkippedRef.current);

      progress.value = withTiming(0, { duration: 300, easing: Easing.linear });
      size.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.exp) });

      runOnJS(setSpamming)(false);
      runOnJS(setTotalSkipped)(0);
      runOnJS(() => onSpammingChange?.(false))();

      totalSkippedRef.current = 0;
    }, 800);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: progress.value * (isLeft ? -120 : 120) }, { scale: size.value }],
    };
  });

  return (
    <View style={{ position: 'relative' }}>
      <AniView
        style={[
          {
            position: 'absolute',
            top: 24,
            left: isLeft ? 26 : 25,
          },
          animatedStyle,
        ]}
      >
        <Txt style={{ fontFamily: 'SemiBold', fontSize: 14 }}>
          {spamming ? `${isLeft ? '-' : '+'}${totalSkipped}` : defaultSkip}
        </Txt>
      </AniView>
      <PlayerButton Icon={isLeft ? RotateCcw : RotateCw} sizeBias={20} onPress={handlePress} />
    </View>
  );
};

const MagicSliders: React.FC<{
  volume: number;
  setVolume: (value: number) => void;
  controlsVisible: boolean;
}> = ({ volume, setVolume, controlsVisible }) => {
  const { store } = useStore();

  // 0 - 1
  const [brightness, setBrightness] = useState<number>(0.5);

  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [showBrightnessSlider, setShowBrightnessSlider] = useState<boolean>(false);

  const prevBrightness = useRef<number>(brightness);
  const prevVolume = useRef<number>(volume);

  // 0 - 100
  const volumeSliderHeight = useSharedValue(0);
  const brightnessSliderHeight = useSharedValue(0);
  const prevVolumeSliderHeight = useSharedValue(0);
  const prevBrightnessSliderHeight = useSharedValue(0);

  const hasStartedTooHigh = useSharedValue(0);

  const { width } = Dimensions.get('window');

  useEffect(() => {
    if (brightness === 1 && prevBrightness.current !== 1 && showBrightnessSlider) {
      hapticVibrate();
    }
    prevBrightness.current = brightness;
  }, [brightness]);

  useEffect(() => {
    if (volume === 1 && prevVolume.current !== 1 && showVolumeSlider) {
      hapticVibrate();
    }
    prevVolume.current = volume;
  }, [volume]);

  const changeVolume = (value: number) => {
    setVolume(value);
  };

  const changeBrightness = async (value: number) => {
    setBrightness(value);
    await Brightness.setBrightnessAsync(value);
  };

  useEffect(() => {
    const initVolume = () => {
      changeVolume(volume);
      volumeSliderHeight.value = volume * panHeight;
      prevVolumeSliderHeight.value = volume * panHeight;
    };

    const initBrightness = async () => {
      const defaultBrightness = store.autoMaxBrightness ? 1 : await Brightness.getBrightnessAsync();

      changeBrightness(defaultBrightness);
      brightnessSliderHeight.value = defaultBrightness * panHeight;
      prevBrightnessSliderHeight.value = defaultBrightness * panHeight;
    };

    initVolume();
    initBrightness();
  }, []);

  const hideSliders = () => {
    setShowBrightnessSlider(false);
    setShowVolumeSlider(false);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart((event) => {
      const touchX = event.absoluteX;
      const touchY = event.absoluteY;

      if (touchY <= 100) {
        hasStartedTooHigh.value = 1;
        return;
      }

      hasStartedTooHigh.value = 0;

      if (touchX < width / 2) {
        setShowBrightnessSlider(true);
        prevBrightnessSliderHeight.value = brightnessSliderHeight.value;
      } else {
        setShowVolumeSlider(true);
        prevVolumeSliderHeight.value = volumeSliderHeight.value;
      }
    })
    .onUpdate((event: { translationY: number; absoluteX: number }) => {
      if (hasStartedTooHigh.value === 1) return;

      const touchX = event.absoluteX;
      const val =
        touchX < width / 2
          ? clamp(prevBrightnessSliderHeight.value - event.translationY, 0, panHeight)
          : clamp(prevVolumeSliderHeight.value - event.translationY, 0, panHeight);

      if (touchX < width / 2) {
        brightnessSliderHeight.value = val;
        changeBrightness(val / panHeight);
      } else {
        volumeSliderHeight.value = val;
        changeVolume(val / panHeight);
      }
    })
    .onEnd(() => {
      hideSliders();
    })
    .onFinalize(() => {
      hideSliders();
    })
    .runOnJS(true);

  const volumeBarStyles = useAnimatedStyle(() => ({
    height: volumeSliderHeight.value,
  }));
  const brightnessBarStyles = useAnimatedStyle(() => ({
    height: brightnessSliderHeight.value,
  }));

  return (
    <GestureHandlerRootView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
      }}
    >
      <GestureDetector gesture={pan}>
        <View
          style={{
            height: '100%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingLeft: FRAME_MARGIN * 5,
            }}
          >
            <PanSlider
              show={controlsVisible || showVolumeSlider}
              Icon={
                volume === 0 ? VolumeOff : volume < 0.3 ? Volume : volume < 0.8 ? Volume1 : Volume2
              }
              sliderAnimatedStyle={volumeBarStyles}
            />
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: FRAME_MARGIN * 5,
            }}
          >
            <PanSlider
              show={controlsVisible || showBrightnessSlider}
              Icon={brightness < 0.5 ? SunDim : Sun}
              sliderAnimatedStyle={brightnessBarStyles}
            />
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const PanSlider: React.FC<{
  show: boolean;
  Icon: LucideIcon;
  sliderAnimatedStyle: any;
}> = ({ show, Icon, sliderAnimatedStyle }) => {
  const { theme } = useTheme();
  const isExpoGo = useIsExpoGo();

  const s = StyleSheet.create({
    shadow: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.7,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  if (!show) return null;

  return (
    <AniView
      entering={isExpoGo ? undefined : FADE_ENTERING}
      exiting={FADE_EXITING}
      style={[
        {
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        },
        s.shadow,
      ]}
    >
      <Icon color={theme.text} size={30} />

      <View
        style={[
          {
            width: 6,
            height: panHeight,
            justifyContent: 'flex-end',
            backgroundColor: '#aeaeae70',
            borderRadius: BORDER_RADIUS,
            overflow: 'hidden',
          },
        ]}
      >
        <AniView
          style={[
            sliderAnimatedStyle,
            {
              position: 'absolute',
              width: '100%',
              backgroundColor: theme.text,
            },
          ]}
        />
      </View>
    </AniView>
  );
};

interface ParsedSubtitle {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
}

const SubtitleViewerComponent: React.FC<{
  currentTime: number;
  subtitle: SubtitleTrack;
}> = ({ currentTime, subtitle }) => {
  const { store } = useStore();

  const [subtitles, setSubtitles] = useState<ParsedSubtitle[]>([]);
  const currentSubtitleRef = useRef<string | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchSubtitles = async () => {
      try {
        const res = await fetch(subtitle.url);
        let text = await res.text();

        // convert MM:SS.mmm in HH:MM:SS.mmm
        text = text.replace(
          /^(\d{2}):(\d{2}\.\d{3}) --> (\d{2}):(\d{2}\.\d{3})$/gm,
          (match, mm1, ssmmm1, mm2, ssmmm2) => {
            return `00:${mm1}:${ssmmm1} --> 00:${mm2}:${ssmmm2}`;
          }
        );

        const parsed = SubtitlesParserVTT.fromVtt(text).map((sub: any) => ({
          ...sub,
          startSeconds: timeToSeconds(sub.startTime),
          endSeconds: timeToSeconds(sub.endTime),
        }));

        if (mounted) {
          setSubtitles(parsed);
        }
      } catch (err) {
        console.warn('Error fetching subtitles:', err);
      }
    };

    fetchSubtitles();

    return () => {
      mounted = false;
    };
  }, [subtitle.url]);

  const activeSubtitle = useMemo(() => {
    const current = subtitles.find(
      (s) => currentTime >= s.startSeconds && currentTime <= s.endSeconds
    );
    const currentText = current?.text ?? null;

    if (currentText !== currentSubtitleRef.current) {
      currentSubtitleRef.current = currentText;

      // nice subtitles logs
      // if (current) {
      //   console.log(
      //     `[Subtitle] "${current.text.slice(0, 3)}..." ` +
      //       `@ ${current.startTime} - currentTime: ${currentTime.toFixed(2)}`
      //   );
      // }

      forceUpdate((n) => n + 1);
    }

    return currentText;
  }, [currentTime, subtitles]);

  return <SubtitlesOverlay activeSubtitle={activeSubtitle} />;
};

const SubtitleViewer = React.memo(SubtitleViewerComponent);
