import { ANIME_ENTRY_HEIGHT, BORDER_RADIUS } from '@/constants/Utils';
import useIsExpoGo from '@/hooks/useIsExpoGo';
import useTheme from '@/hooks/useTheme';
import { MediaResult } from '@/models/plugins';
import { AniPressable, AniView } from '@/modules/reanimatedSingleton';
import { Image, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import Txt from './ui/Txt';

const AnimeEntryPoor: React.FC<{
  mediaResult: MediaResult;
  onPress: (mediaId: string) => void;
}> = ({ mediaResult, onPress }) => {
  const { theme } = useTheme();
  const isExpoGo = useIsExpoGo();

  const fontSize = 12;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }] as any,
  }));

  return (
    <AniView entering={isExpoGo ? undefined : FadeIn.duration(200)}>
      <AniPressable
        onPressIn={() => {
          scale.value = withTiming(0.95, { duration: 70 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => {
          onPress(mediaResult.id);
        }}
        style={[
          animatedStyle,
          {
            flexDirection: "column",
            gap: 4,
            marginRight: 8,
            width: ANIME_ENTRY_HEIGHT / 1.45,
          },
        ]}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri: mediaResult.image,
            }}
            style={{
              height: ANIME_ENTRY_HEIGHT,
              width: "100%",
              borderRadius: BORDER_RADIUS,
              backgroundColor: theme.foreground,
            }}
          />
        </View>

        <Txt
          style={{
            fontFamily: "Bold",
            fontSize: fontSize,
            textAlign: "left",
            width: "100%",
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {mediaResult.title}
        </Txt>
      </AniPressable>
    </AniView>
  );
};

export default AnimeEntryPoor;
