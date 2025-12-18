import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { AniPressable } from '@/modules/reanimatedSingleton';
import { hapticVibrate } from '@/modules/utils/haptics';
import { BlurView } from 'expo-blur';
import { LucideProps } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Txt from '../ui/Txt';

export const TabBarComponent: React.FC<{
  Icon: React.FC<LucideProps>;
  picture?: string;
  focused: boolean;
  focusedEffect?: 'fill' | 'stroke';
  title: string;
  onPress?: any;
}> = ({ Icon, picture, focused, focusedEffect = 'fill', title, onPress }) => {
  const { theme } = useTheme();
  const { store } = useStore();

  const scale = useSharedValue(1);

  const fontFamily = focused ? 'SemiBold' : 'Medium';
  const color = focused ? theme.primary : theme.textShy;
  const delay = 60;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const showLabel = (() => {
    switch (store.tabBarLabelStyle) {
      case 'all':
        return true;
      case 'activeOnly':
        return focused;
      case 'none':
      default:
        return false;
    }
  })();

  return (
    <AniPressable
      onPress={() => {
        store.tabBarHapticEnabled && hapticVibrate();
        onPress && onPress();
      }}
      onPressIn={() => {
        if (store.tabBarIconBounce) scale.value = withTiming(0.9, { duration: delay });
      }}
      onPressOut={() => {
        if (store.tabBarIconBounce)
          scale.value = withSequence(
            withTiming(1.1, { duration: delay }),
            withTiming(1, { duration: delay })
          );
      }}
      style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 2 }, animatedStyle]}
    >
      {picture ? (
        <Image
          source={{
            uri: picture,
          }}
          style={{
            height: 30,
            width: 30,
            marginTop: 4,
            borderRadius: 9999999,
            backgroundColor: theme.mist,
          }}
        />
      ) : (
        <Icon
          color={color}
          size={24}
          strokeWidth={focused && focusedEffect === 'stroke' ? 2.5 : 1.5}
          fill={focused && focusedEffect === 'fill' ? color : theme.transparent}
          style={{ marginTop: 2 }}
        />
      )}

      {showLabel && <Txt style={{ fontFamily, marginTop: 2, fontSize: 11, color }}>{title}</Txt>}
    </AniPressable>
  );
};

export const TabBarBackground: React.FC<{ bg: string }> = ({ bg }) => {
  const { store } = useStore();
  const { theme } = useTheme();

  if (store.tabBarBlur) {
    return (
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          backgroundColor: bg,
          flex: 1,
        }}
      />
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.background,
        flex: 1,
      }}
    />
  );
};
