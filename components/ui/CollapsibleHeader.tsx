import { FRAME_MARGIN } from '@/constants/Utils';
import { AniBlurView, AniSafeAreaView, AniTxt } from '@/modules/reanimatedSingleton';
import { hapticVibrate } from '@/modules/utils/haptics';
import { LucideIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated';

import { IconCircleButton } from './Buttons';

const CollapsibleHeader: React.FC<{
  text?: string;
  IconLeft?: LucideIcon;
  onIconLeftPress?: () => {};
  IconRight?: LucideIcon;
  onIconRightPress?: () => {};
  scrollY: number;
}> = ({ text, IconLeft, onIconLeftPress, IconRight, onIconRightPress, scrollY }) => {
  const height = Dimensions.get('window').height;

  const headerOpacityValue = useSharedValue(0);
  const headerTitleOpacityValue = useSharedValue(0);
  const headerTitleTranslateYValue = useSharedValue(10);

  const handleScroll = () => {
    const range = [height * 0.45, height * 0.45 + 30];

    headerOpacityValue.value = interpolate(scrollY, range, [0, 1]);
    headerTitleOpacityValue.value = interpolate(scrollY, range, [0, 1], Extrapolation.CLAMP);
    headerTitleTranslateYValue.value = interpolate(scrollY, range, [10, 0], Extrapolation.CLAMP);
  };

  useEffect(() => handleScroll, [scrollY]);

  return (
    <AniSafeAreaView
      edges={['top']}
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingHorizontal: FRAME_MARGIN,
          paddingBottom: FRAME_MARGIN / 2,
          zIndex: 10,
        },
      ]}
    >
      <AniBlurView
        tint="dark"
        intensity={80}
        style={[
          {
            ...StyleSheet.absoluteFillObject,
          },
          {
            opacity: headerOpacityValue,
          },
        ]}
      />

      {IconLeft && (
        <IconCircleButton
          Icon={IconLeft}
          onPress={() => {
            hapticVibrate();
            onIconLeftPress && onIconLeftPress();
          }}
        />
      )}

      <AniTxt
        style={[
          {
            fontFamily: 'SemiBold',
            fontSize: 16,
            maxWidth: '75%',
            lineHeight: 28,
          },
          {
            opacity: headerTitleOpacityValue,
            transform: [{ translateY: headerTitleTranslateYValue }],
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {text}
      </AniTxt>

      {IconRight && (
        <IconCircleButton
          Icon={IconRight}
          onPress={() => {
            hapticVibrate();
            onIconRightPress && onIconRightPress();
          }}
        />
      )}
    </AniSafeAreaView>
  );
};

export default CollapsibleHeader;
