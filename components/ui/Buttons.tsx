import { PLAYER_TOGGLE_CONTROLS_TIMING } from '@/constants/PlayerAnimations';
import { BORDER_RADIUS } from '@/constants/Utils';
import useIsExpoGo from '@/hooks/useIsExpoGo';
import useTheme from '@/hooks/useTheme';
import { getButtonStyle, getTextStyle, useButtonPressAnimation } from '@/modules/buttonsStyle';
import { AniTouchableOpacity, AniView } from '@/modules/reanimatedSingleton';
import { BlurView } from 'expo-blur';
import { LucideIcon } from 'lucide-react-native';
import React, { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ColorValue,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';

import { Image } from 'expo-image';
import { ImageSourcePropType } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  square?: boolean;
  type?: 'primary' | 'destructive' | 'outline' | 'ghost';
  bg?: ColorValue;
  accent?: ColorValue;
  fillIcon?: boolean;
  LeftIcon?: LucideIcon;
  LeftImage?: ImageSourcePropType | string;
  RightIcon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  square = false,
  type = 'primary',
  bg,
  accent,
  fillIcon,
  LeftIcon,
  LeftImage,
  RightIcon,
  loading = false,
  ...props
}) => {
  const { theme } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <AniTouchableOpacity
      activeOpacity={0.5}
      // activeOpacity={1}
      {...props}
      // onPressIn={handlePressIn}
      // onPressOut={handlePressOut}
      style={[
        {
          borderRadius: BORDER_RADIUS,
          height: 52,
          width: square ? 52 : undefined,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
        },
        getButtonStyle(theme, type),
        bg ? { backgroundColor: bg } : {},
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={accent ?? theme.text} />
      ) : (
        <>
          {LeftImage ? (
            <Image
              source={LeftImage}
              style={{ width: 24, height: 24, marginRight: 4 }}
              contentFit="cover"
            />
          ) : LeftIcon ? (
            <LeftIcon
              color={accent ?? getTextStyle(theme, type)!.color}
              fill={fillIcon ? accent ?? theme.text : 'transparent'}
              size={20}
            />
          ) : null}

          {title && (
            <Text
              style={[
                {
                  fontFamily: 'SemiBold',
                  fontSize: 16,
                },
                getTextStyle(theme, type),
                accent ? { color: accent } : {},
              ]}
            >
              {title}
            </Text>
          )}

          {RightIcon && <RightIcon color={accent ?? getTextStyle(theme, type)!.color} size={20} />}
        </>
      )}
    </AniTouchableOpacity>
  );
};

interface IconLabelButtonProps extends TouchableOpacityProps {
  title: string;
  Icon: LucideIcon;
  accent?: ColorValue;
  type?: 'primary' | 'outline';
  direction?: 'row' | 'column';
  sizeBias?: number;
}

export const IconLabelButton: React.FC<IconLabelButtonProps> = ({
  title,
  Icon,
  accent,
  direction = 'column',
  sizeBias = 0,
  ...props
}) => {
  const { theme } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <AniTouchableOpacity
      activeOpacity={1}
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          borderRadius: 99999999,
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: direction,
          gap: direction === 'row' ? 3 : 0,
        },
        animatedStyle,
      ]}
    >
      <Icon
        color={accent ?? theme.text}
        size={20 + sizeBias}
        style={{ marginBottom: direction === 'row' ? 0 : 5 }}
      />

      <Text
        style={{
          fontFamily: 'SemiBold',
          fontSize: (direction === 'row' ? 15 : 13) + sizeBias,
          color: accent ?? theme.text,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </AniTouchableOpacity>
  );
};

export interface IconCircleButtonProps extends TouchableOpacityProps {
  Icon: LucideIcon;
  type?: 'primary' | 'outline';
  hitSlop?: number;
  accent?: ColorValue;
  fillIcon?: boolean;
  sizeBias?: number;
  largerTouchArea?: boolean;
  iconContainerAnimatedStyle?: any;
}

export const IconCircleButton: React.FC<IconCircleButtonProps> = ({
  Icon,
  sizeBias = 0,
  hitSlop,
  accent,
  fillIcon,
  largerTouchArea = false,
  iconContainerAnimatedStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();

  const size = 20 + sizeBias;
  const padding = 8;

  return (
    <AniTouchableOpacity
      activeOpacity={1}
      hitSlop={hitSlop}
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          padding: largerTouchArea ? 15 : padding - 3,
          borderRadius: '100%',
        },
        animatedStyle,
      ]}
    >
      <AniView
        style={[
          {
            borderRadius: '100%',
            padding: padding - 5,
          },
          iconContainerAnimatedStyle,
        ]}
      >
        <Icon
          color={accent ?? theme.text}
          size={size}
          fill={fillIcon ? accent ?? theme.text : 'transparent'}
        />
      </AniView>
    </AniTouchableOpacity>
  );
};

interface PlayerButtonProps extends TouchableOpacityProps {
  Icon: LucideIcon;
  text?: string;
  secondaryText?: string;
  fillIcon?: boolean;
  sizeBias?: number;
  disabled?: boolean;
}

export const PlayerButton: React.FC<PlayerButtonProps> = memo(
  ({ Icon, text, secondaryText, fillIcon = false, sizeBias = 0, disabled, ...props }) => {
    const { theme } = useTheme();

    const color = disabled ? theme.textMuted : theme.text;

    return (
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.3}
        {...props}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          // backgroundColor: "#F8238231",
          backgroundColor: 'transparent',
          borderRadius: 9999,
        }}
      >
        <Icon
          strokeWidth={1.5}
          size={25 + sizeBias}
          fill={fillIcon ? color : 'transparent'}
          color={color}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.text === nextProps.text &&
      prevProps.secondaryText === nextProps.secondaryText &&
      prevProps.fillIcon === nextProps.fillIcon &&
      prevProps.sizeBias === nextProps.sizeBias &&
      prevProps.Icon === nextProps.Icon &&
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    );
  }
);

export const PlayerSkipButton: React.FC<ButtonProps> = ({
  title,
  accent,
  fillIcon,
  LeftIcon,
  ...props
}) => {
  const { theme } = useTheme();
  const isExpoGo = useIsExpoGo();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <AniView
      entering={isExpoGo ? undefined : FadeIn.duration(PLAYER_TOGGLE_CONTROLS_TIMING)}
      exiting={FadeOut.duration(PLAYER_TOGGLE_CONTROLS_TIMING)}
    >
      <AniTouchableOpacity
        activeOpacity={0.5}
        style={[
          {
            borderRadius: BORDER_RADIUS,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <BlurView
          intensity={30}
          tint="light"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: BORDER_RADIUS,
            backgroundColor: '#3b3b3b80',
          }}
        >
          {LeftIcon && <LeftIcon color={theme.text} size={18} />}

          {title && (
            <Text
              style={{
                fontFamily: 'SemiBold',
                fontSize: 14,
                color: theme.text,
              }}
            >
              {title}
            </Text>
          )}
        </BlurView>
      </AniTouchableOpacity>
    </AniView>
  );
};
