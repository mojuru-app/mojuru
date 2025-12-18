import { userInfoAtom, userListsAtom } from '@/atoms';
import Frame from '@/components/Frame';
import MediaSection from '@/components/media/MediaSection';
import SpotlightMediaSection from '@/components/media/SpotlightMediaSection';
import { Button } from '@/components/ui/Buttons';
import { MOCK_STREAMING_SOURCES } from '@/constants/Mocks';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import { useMedia } from '@/hooks/useMedia';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import {
  fetchBecauseYouLiked,
  fetchPopular,
  fetchTrending,
  fetchUserLists,
  retrieveSpotlight,
} from '@/models/fetchAniListLists';
import { MediaData } from '@/models/mediaData';
import { router } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { useSharedValue } from 'react-native-reanimated';

export default function HomeScreen() {
  const { isLoggedInWithAniList, anilistViewerId } = useAniListAuth();
  const { pluginsWithMedia } = usePluginManager();
  const { premiumFeatures } = usePremiumFeatures();

  const userInfoAtomValue = useAtomValue(userInfoAtom);
  const [userLists, setUserLists] = useAtom(userListsAtom);
  const { ensureMedia } = useMedia();

  const { height } = Dimensions.get('window');

  const scaleValue = useSharedValue(1);
  const translateYValue = useSharedValue(0);

  /**
   * MediaData/MediaData[]: fetched
   * undefined: fetching
   * null: error while fetching / no list
   */
  const [spotlightMedia, setSpotlightMedia] = useState<MediaData | undefined | null>();
  const [becauseYouLikedTitle, setBecauseYouLikedTitle] = useState<string>();
  const [becauseYouLikedList, setBecauseYouLikedList] = useState<MediaData[] | undefined | null>();
  const [trendingMedia, setTrendingMedia] = useState<MediaData[] | undefined | null>();
  const [popularMedia, setPopularMedia] = useState<MediaData[] | undefined | null>();
  const [continueWatching, setContinueWatching] = useState<MediaData[] | undefined | null>();

  useEffect(() => {
    if (!premiumFeatures && Math.random() < 1 / 10) {
      router.push('/premium-landing');
    }
  }, []);

  useEffect(() => {
    const fetchLists = () => {
      fetchTrending().then((trending) => {
        setTrendingMedia(trending);

        const spAnime = retrieveSpotlight(trending);
        setSpotlightMedia(spAnime);

        if (spAnime) {
          ensureMedia('anilist', spAnime);
        }
      });

      fetchPopular().then((popular) => {
        setPopularMedia(popular);
      });
    };

    fetchLists();
  }, []);

  useEffect(() => {
    if (userLists === null) {
      setContinueWatching(null);
    } else {
      const combinedLists = [...(userLists?.CURRENT || []), ...(userLists?.REPEATING || [])];

      setContinueWatching(combinedLists.length > 0 ? combinedLists : null);
    }
  }, [userLists]);

  useEffect(() => {
    const fetchAuthLists = () => {
      fetchUserLists(anilistViewerId).then(async (lists) => {
        if (lists === null) {
          setContinueWatching(null);
        } else {
          setUserLists(lists);

          const combinedLists = [...(lists?.CURRENT || []), ...(lists?.REPEATING || [])];

          setContinueWatching(combinedLists.length > 0 ? combinedLists : null);
        }

        // BYL = because you liked
        const BYL = await fetchBecauseYouLiked(lists?.COMPLETED ?? null);

        if (BYL === null) {
          setBecauseYouLikedList(null);
        } else {
          setBecauseYouLikedList(BYL.BYLList);
          setBecauseYouLikedTitle(BYL.BYLTitle);
        }
      });
    };

    if (!isLoggedInWithAniList) return;

    fetchAuthLists();
  }, [isLoggedInWithAniList]);

  const handleTabScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;

    scaleValue.value = y < 0 ? Math.max(1 - y / 500, 0.5) : 1;
    translateYValue.value = y < 0 ? y / 3 : y / 8;
  };

  return (
    <Frame
      isTab
      showCollapsibleHeader
      collapsibleHeaderHeight={height * 0.4}
      bouncingImage={{
        imageCover: spotlightMedia?.coverImage,
      }}
      safeAreaProps={{ edges: ['left', 'right', 'bottom'] }}
      onScroll={handleTabScroll}
      scrollEventThrottle={16}
    >
      <View style={{ top: -height * 0.1 }}>
        {spotlightMedia && (
          <SpotlightMediaSection id={spotlightMedia.id.toString()} provider="anilist" />
        )}

        {/* <Button
          title="mock"
          onPress={() => {
            SheetManager.show('choose-streaming-source-sheet', {
              payload: { sources: MOCK_STREAMING_SOURCES },
            } as any);
          }}
        /> */}

        {isLoggedInWithAniList && (
          <MediaSection
            title={`${userInfoAtomValue?.name}, continue watching:`}
            provider="anilist"
            mediaList={continueWatching}
          />
        )}

        <MediaSection
          title="Trending now"
          provider="anilist"
          mediaList={trendingMedia}
          lazy={false}
        />

        {isLoggedInWithAniList && (
          <MediaSection
            provider="anilist"
            title={`Because you liked ${becauseYouLikedTitle}`}
            mediaList={becauseYouLikedList}
          />
        )}

        {/* {pluginsWithMedia.map((p, index) => (
          <MediaSection
            key={index}
            provider="plugin"
            forcedPlugin={p}
            title={p.metadata.name}
            mediaList={[p.metadata.media!]}
          />
        ))} */}

        <MediaSection title="Most Popular" provider="anilist" mediaList={popularMedia} />
      </View>
    </Frame>
  );
}
