import {
  ANIME_ENTRY_HEIGHT,
  ANIME_ENTRY_WIDTH,
  BORDER_RADIUS,
  FRAME_MARGIN,
} from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import LazyFlatList from './ui/LazyFlatList';
import { getRandomMultiplier } from '@/modules/utils/math';
import { AniView } from '@/modules/reanimatedSingleton';

type SizeType = number | `${number}%`;

const SkeletonLoader: React.FC<{
  width: number;
  height: number;
  borderRadius?: number;
}> = ({ width, height, borderRadius = BORDER_RADIUS }) => {
  const { theme } = useTheme();
  const translateX = useSharedValue<number>(-width);

  React.useEffect(() => {
    translateX.value = withRepeat(withTiming(width, { duration: 2000 }), -1, false);
  }, [width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        overflow: 'hidden',
        backgroundColor: theme.foreground,
        width,
        height,
        borderRadius,
      }}
    >
      <AniView style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[theme.foreground.toString(), theme.mist.toString(), theme.foreground.toString()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </AniView>
    </View>
  );
};

export const MediaEntrySkeleton = () => {
  const width2 = ANIME_ENTRY_WIDTH * getRandomMultiplier(0.5, 0.95);
  const width3 = ANIME_ENTRY_WIDTH * getRandomMultiplier(0.4, 0.7);

  return (
    <View style={{ gap: 4 }}>
      <SkeletonLoader width={ANIME_ENTRY_WIDTH} height={ANIME_ENTRY_HEIGHT} />
      <SkeletonLoader width={width2} height={16} />
      <SkeletonLoader width={width3} height={10} />
    </View>
  );
};

export const MediaSectionSkeleton = () => {
  const data = new Array(30).fill(null);
  const width1 = 150 * getRandomMultiplier(0.8, 1.6);

  return (
    <View
      style={{
        gap: 10,
        marginBottom: 25,
        paddingLeft: FRAME_MARGIN,
      }}
    >
      <SkeletonLoader width={width1} height={20} />

      <LazyFlatList
        scrollEnabled={false}
        horizontal
        data={data}
        contentContainerStyle={{
          gap: 8,
        }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => <MediaEntrySkeleton />}
      />
    </View>
  );
};

export const SpotlightMediaSectionSkeleton = () => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height * 0.7;

  return (
    <>
      <View>
        <SkeletonLoader width={screenWidth} height={screenHeight} />

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', theme.background.toString()]}
          style={{
            position: 'absolute',
            width: screenWidth,
            height: screenHeight,
            top: 0,
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>
    </>
  );
};

export const MediaGridSkeleton = () => (
  <View
    style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: FRAME_MARGIN,
    }}
  >
    {Array.from({ length: 18 }).map((_, index) => (
      <View key={index} style={{ width: '30%', marginBottom: 10 }}>
        <MediaEntrySkeleton key={index} />
      </View>
    ))}
  </View>
);
