import React, { useState, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Platform, Vibration } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import Txt from './Txt';
import useTheme from '@/hooks/useTheme';
import { AvailableThemes, Colors, ColorsDescriptions, ThemeColor } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.55;
const SPACING = 0;

const data = Object.entries(Colors).map(([themeName, themeColors]) => ({
  key: themeName,
  name: themeName,
  colors: themeColors,
}));

const triggerHaptic = () => {
  if (Platform.OS === 'ios') {
    Vibration.vibrate(10);
  } else {
    Vibration.vibrate(10);
  }
};

const CarouselItem: React.FC<{
  index: number;
  scrollX: Animated.SharedValue<number>;
  colors: ThemeColor;
  name: string;
  activeIndex: number;
  onPress: () => void;
}> = memo(({ index, scrollX, colors, name, activeIndex, onPress }) => {
  const pieceSize = ITEM_WIDTH;
  const bottomPiecesSizeW = pieceSize / 3;
  const bottomPiecesSizeH = pieceSize * 0.3;
  const scalingRatio = 0.6;

  const animatedStyle = useAnimatedStyle(() => {
    const position = index * (ITEM_WIDTH + SPACING);
    const distance = Math.abs(scrollX.value - position);
    const scale = interpolate(distance, [0, ITEM_WIDTH], [1, scalingRatio], Extrapolate.CLAMP);
    const opacity = interpolate(distance, [0, ITEM_WIDTH], [1, 0.5], Extrapolate.CLAMP);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[{ justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
        <View
          style={{
            width: pieceSize,
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 24,
          }}
        >
          <View
            style={{
              width: pieceSize,
              height: pieceSize * 0.7,
              backgroundColor: colors.primary,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                width: bottomPiecesSizeW,
                height: bottomPiecesSizeH,
                backgroundColor: colors.background,
              }}
            />
            <View
              style={{
                width: bottomPiecesSizeW,
                height: bottomPiecesSizeH,
                backgroundColor: colors.foreground,
              }}
            />
            <View
              style={{
                width: bottomPiecesSizeW,
                height: bottomPiecesSizeH,
                backgroundColor: colors.mist,
              }}
            />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const FancyCarousel: React.FC = () => {
  const { theme } = useTheme();

  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const renderIndicators = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 12,
          gap: 8,
        }}
      >
        {data.map((_, i) => (
          <View
            key={i.toString()}
            style={{
              width: i === activeIndex ? 14 : 8,
              height: i === activeIndex ? 14 : 8,
              borderRadius: 14,
              backgroundColor: i === activeIndex ? theme.primary : theme.textShy,
              opacity: i === activeIndex ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    );
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / (ITEM_WIDTH + SPACING));
      runOnJS(setActiveIndex)(index);
    },
  });

  const onSelectTheme = (index: number) => {
    setActiveIndex(index);
    triggerHaptic();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 40,
      }}
    >
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 }}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <CarouselItem
            index={index}
            scrollX={scrollX}
            colors={item.colors}
            name={item.name}
            activeIndex={activeIndex}
            onPress={() => onSelectTheme(index)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      />

      {renderIndicators()}

      <View style={{ margin: 'auto', width: '80%', marginTop: 16, gap: 8 }}>
        <Txt style={{ textAlign: 'center', fontFamily: 'Bold', fontSize: 30 }}>{data[activeIndex]?.name}</Txt>
        <Txt style={{ textAlign: 'center', fontFamily: 'Medium', fontSize: 18, color: theme.textShy }}>
          {ColorsDescriptions[data[activeIndex]?.name as AvailableThemes] ?? ''}
        </Txt>
      </View>
    </View>
  );
};

export default FancyCarousel;
