import { RelationTypes } from '@/constants/Anilist';
import { ANIME_ENTRY_HEIGHT, BORDER_RADIUS, FRAME_MARGIN } from '@/constants/Utils';
import useDynColors from '@/hooks/useDynColors';
import useIsExpoGo from '@/hooks/useIsExpoGo';
import { useMedia } from '@/hooks/useMedia';
import useTheme from '@/hooks/useTheme';
import { MediaData, MediaProvider } from '@/models/mediaData';
import { Plugin } from '@/models/plugins';
import { getMediaDataSource } from '@/modules/mediaInfoAdapters/mediaDataFactory';
import { AniPressable, AniView } from '@/modules/reanimatedSingleton';
import { getContrastYIQ } from '@/modules/utils/color';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, View } from 'react-native';
import {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Txt from '../ui/Txt';

const MediaCard: React.FC<{
  media: MediaData;
  provider: MediaProvider;
  forcedPlugin?: Plugin;
  style?: object;
  /**
   * to use when you want to show a wide anime entry alone in a section
   */
  isWide?: boolean;
}> = ({ media, provider, forcedPlugin, style, isWide = false }) => {
  const { ensureMedia } = useMedia();
  const { dynColors } = useDynColors(media);
  const { width } = Dimensions.get('window');
  const scale = useSharedValue(1);
  const isExpoGo = useIsExpoGo();
  const { theme } = useTheme();
  const router = useRouter();

  const [genres, setGenres] = useState<string>();
  const [hasNewEpisode, setHasNewEpisode] = useState<boolean>();

  const fontSize = 12;
  const mediaDataSource = getMediaDataSource(provider);

  useEffect(() => {
    setGenres(
      media.genres && media.genres.length > 0
        ? media.genres[Math.floor(Math.random() * Math.min(3, media.genres.length))]
        : ''
    );
    setHasNewEpisode(mediaDataSource.hasNewEpisode(media));
  }, [media]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }] as any,
  }));

  const handlePress = () => {
    ensureMedia(provider, media);

    router.push({
      pathname: `/media-page/[id]`,
      params: { id: media.id, provider, forcedPlugin: JSON.stringify(forcedPlugin) },
    });
  };

  return (
    <AniView entering={isExpoGo ? undefined : FadeIn.duration(200)}>
      <AniPressable
        onPressIn={() => {
          scale.value = withTiming(0.95, { duration: 70 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handlePress}
        style={[
          animatedStyle,
          {
            flexDirection: 'column',
            gap: 4,
            marginRight: 8,
            width: isWide ? width - FRAME_MARGIN * 2 : ANIME_ENTRY_HEIGHT / 1.45,
          },
          style,
        ]}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri: isWide ? media.bannerImage?.large : media.coverImage?.large,
            }}
            style={{
              height: ANIME_ENTRY_HEIGHT,
              width: '100%',
              borderRadius: BORDER_RADIUS,
              backgroundColor: media.color,
            }}
          />

          {hasNewEpisode && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
              }}
            >
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: dynColors.primary,
                  paddingVertical: 2,
                  paddingHorizontal: 4,
                  borderTopLeftRadius: BORDER_RADIUS,
                  borderTopRightRadius: BORDER_RADIUS,
                }}
              >
                <Txt
                  style={{
                    fontFamily: 'SemiBold',
                    color: getContrastYIQ(dynColors.primary),
                    fontSize: 10,
                  }}
                >
                  New episode
                </Txt>
              </View>
            </View>
          )}
        </View>

        <>
          <Txt
            style={{
              fontFamily: 'Bold',
              fontSize: fontSize,
              textAlign: 'left',
              width: '100%',
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {media.title}
          </Txt>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Txt
              style={{
                fontFamily: 'Medium',
                color: theme.textShy,
                textAlign: 'left',
                fontSize: fontSize,
              }}
            >
              {media.relationType ? RelationTypes[media.relationType] : genres}
            </Txt>
          </View>
        </>
      </AniPressable>
    </AniView>
  );
};

export default MediaCard;
