import { FRAME_MARGIN, TAB_BAR_HEIGHT } from '@/constants/Utils';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { LocalMediaCoverImage, MediaCoverImage } from '@/models/anilist';
import { AniBlurView, AniImage, AniSafeAreaView, AniTxt, AniView } from '@/modules/reanimatedSingleton';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, LucideIcon, X } from 'lucide-react-native';
import React, { ForwardedRef, useEffect } from 'react';
import {
  ColorValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
} from 'react-native';
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

import BigHeading from './ui/BigHeading';
import { IconCircleButton } from './ui/Buttons';

type HeaderIcon = {
  icon: LucideIcon;
  onPress?: () => void;
  accent?: ColorValue;
};

type BouncingImage = {
  imageCover?: MediaCoverImage | LocalMediaCoverImage;
  imageColor?: string;
};

export interface FrameProps extends ScrollViewProps {
  /**
   * whether you are Paginating a tab or not
   * used for tab needs (e.g. marginBottom to avoid menu overlap)
   * defaults to false
   */
  isTab?: boolean;
  /**
   * pass false to disable scrollview scroll (sometimes useful)
   */
  scrollable?: boolean;
  /**
   * ScrollView bouncing related effects
   * defaults to true
   */
  bounch?: boolean;
  /**
   * show a big title to the top
   */
  bigHeading?: string;
  /**
   * show a collapsible header
   * defaults to false
   */
  showCollapsibleHeader?: boolean;
  /**
   * if you want a fixed collapsible header
   * defaults to false
   */
  collapsibleHeaderFixed?: boolean;
  /**
   * text for collapsible header
   * leave blank for a header without text
   */
  collapsibleHeaderText?: string;
  /**
   * at which height show the collapsible header
   * defaults to 10 (tabs' default)
   */
  collapsibleHeaderHeight?: number;
  /**
   * cover image with animated bouncing effect
   * leave blank if no image is wanted
   */
  bouncingImage?: BouncingImage;
  /**
   * additional collapsible header content to the bottom
   */
  leftIcons?: HeaderIcon[];
  rightIcons?: HeaderIcon[];
  backButton?: boolean;
  modalBackButton?: boolean;
  collapsibleHeaderContent?: React.ReactNode;
  safeAreaProps?: SafeAreaViewProps;
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
}

const Frame = React.forwardRef(
  (
    {
      children,
      safeAreaProps,
      isTab = false,
      scrollable = true,
      bounch = true,
      bigHeading,
      bouncingImage,
      collapsibleHeaderText,
      showCollapsibleHeader = false,
      collapsibleHeaderFixed = false,
      collapsibleHeaderHeight = 10,
      collapsibleHeaderContent,
      leftIcons,
      rightIcons,
      backButton = false,
      modalBackButton = false,
      onScroll,
      ...scrollViewProps
    }: FrameProps,
    ref: ForwardedRef<ScrollView>
  ) => {
    const { store } = useStore();
    const { theme } = useTheme();

    const width = store.deviceWidth;
    const height = store.deviceHeight;
    const contentThresholdHeight = height * 0.55;

    const darkImageColor = (bouncingImage && bouncingImage.imageColor) ?? theme.background.toString();

    const headerOpacityValue = useSharedValue(0);
    const headerTitleOpacityValue = useSharedValue(0);
    const headerTitleTranslateYValue = useSharedValue(10);
    const headerIconsOpacity = useSharedValue(1);
    const scrollY = useSharedValue(0);

    const aniWidth = useSharedValue(width);
    const aniOpacity = useSharedValue(1);
    const aniTop = useSharedValue(0);

    const aniViewStyle = useAnimatedStyle(() => {
      return {
        top: aniTop.value,
      };
    });

    const aniImageStyle = useAnimatedStyle(() => {
      return {
        width: aniWidth.value,
        opacity: aniOpacity.value,
      };
    });

    const frameScrollHandler = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const range = [collapsibleHeaderHeight, collapsibleHeaderHeight + 30];

      headerOpacityValue.value = interpolate(y, range, [0, 1], Extrapolation.CLAMP);
      headerTitleOpacityValue.value = interpolate(y, range, [0, 1], Extrapolation.CLAMP);
      headerTitleTranslateYValue.value = interpolate(y, range, [10, 0], Extrapolation.CLAMP);
    };

    const animatedBackgroundStyle = useAnimatedStyle(() => {
      if (!bouncingImage) return { backgroundColor: 'transparent' };

      const range = [collapsibleHeaderHeight, collapsibleHeaderHeight + 30];

      const backgroundColor = interpolateColor(scrollY.value, range, [
        bouncingImage.imageColor ? `${bouncingImage.imageColor}80` : 'transparent',
        'transparent',
      ]);
      return { backgroundColor };
    });

    const headerIconsScrollHandler = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollY.value = y;

      headerIconsOpacity.value = interpolate(y, [-20, -140], [1, 0], Extrapolation.CLAMP);
    };

    const bouncingImageScrollHandler = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;

      if (y < 0) {
        aniWidth.value = (width * (contentThresholdHeight - y)) / contentThresholdHeight;
      } else {
        aniOpacity.value = interpolate(y, [height * 0.3, height * 0.6], [1, 0], Extrapolation.EXTEND);
      }

      aniTop.value = interpolate(y, [0, height * 0.6], [0, -150], Extrapolation.CLAMP);
    };

    const handleScroll = (event: any) => {
      frameScrollHandler(event);
      if (onScroll) onScroll(event);
      if (bouncingImage) headerIconsScrollHandler(event);
      if (bouncingImage) bouncingImageScrollHandler(event);
    };

    const renderHeaderIcons = (icons?: HeaderIcon[], prefix?: string) =>
      icons?.map((i, index) => (
        <IconCircleButton
          key={`${prefix}-icon-${index}`}
          Icon={i.icon}
          iconContainerAnimatedStyle={animatedBackgroundStyle}
          {...i}
        />
      ));

    const headerBlurStyle = useAnimatedStyle(() => {
      return {
        opacity: collapsibleHeaderFixed ? 1 : headerOpacityValue.value,
      };
    });

    const renderCollapsibleHeader = () => {
      return (
        showCollapsibleHeader && (
          <AniSafeAreaView
            edges={['top']}
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                paddingHorizontal: FRAME_MARGIN,
                paddingVertical: collapsibleHeaderText ? FRAME_MARGIN / 2 : 0,
                zIndex: 10,
              },
            ]}
          >
            <AniView style={[headerBlurStyle, { ...StyleSheet.absoluteFillObject }]}>
              <AniBlurView
                tint="dark"
                intensity={80}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: collapsibleHeaderText ? 'transparent' : theme.background,
                }}
              />
            </AniView>

            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                paddingVertical: collapsibleHeaderText ? 5 : 0,
              }}
            >
              <View
                style={{
                  position: 'relative',
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {collapsibleHeaderText && (
                  <AniTxt
                    style={[
                      {
                        top: 0,
                        fontFamily: 'SemiBold',
                        fontSize: 16,
                        maxWidth: '75%',
                      },
                      {
                        opacity: collapsibleHeaderFixed ? 1 : headerTitleOpacityValue,
                        transform: collapsibleHeaderFixed ? [] : [{ translateY: headerTitleTranslateYValue }],
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {collapsibleHeaderText}
                  </AniTxt>
                )}

                <AniView
                  style={[
                    {
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      flexDirection: 'row',
                    },
                    { opacity: headerIconsOpacity },
                  ]}
                >
                  {backButton &&
                    renderHeaderIcons(
                      [
                        {
                          icon: ArrowLeft,
                          onPress: () => {
                            router.back();
                          },
                        },
                      ],
                      'back'
                    )}
                  {renderHeaderIcons(leftIcons, 'left')}
                </AniView>
                <AniView
                  style={[
                    {
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      flexDirection: 'row',
                    },
                    { opacity: headerIconsOpacity },
                  ]}
                >
                  {renderHeaderIcons(rightIcons, 'right')}
                  {modalBackButton &&
                    renderHeaderIcons(
                      [
                        {
                          icon: X,
                          onPress: () => {
                            router.back();
                          },
                        },
                      ],
                      'back'
                    )}
                </AniView>
              </View>
              <View>{collapsibleHeaderContent}</View>
            </View>
          </AniSafeAreaView>
        )
      );
    };

    const renderBouncingImage = () => {
      return (
        bouncingImage && (
          <AniView style={[aniViewStyle, { flex: 1, alignItems: 'center' }]}>
            <AniImage
              source={{
                uri: bouncingImage.imageCover?.extraLarge,
              }}
              resizeMode="cover"
              style={[
                aniImageStyle,
                {
                  aspectRatio: width / contentThresholdHeight,
                },
              ]}
            />
          </AniView>
        )
      );
    };

    const renderContent = () => {
      return (
        <>
          {bigHeading && <BigHeading text={bigHeading} />}

          {bouncingImage && (
            <LinearGradient
              colors={['transparent', darkImageColor]}
              style={[
                {
                  position: 'absolute',
                  width: width,
                  height: contentThresholdHeight,
                  top: 0,
                },
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          )}

          <View
            style={{
              flex: scrollable ? undefined : 1,
              height: '100%',
              marginTop: bouncingImage ? contentThresholdHeight : 0,
              backgroundColor: darkImageColor,
            }}
          >
            {children}
          </View>
        </>
      );
    };

    return (
      <>
        {renderCollapsibleHeader()}

        {renderBouncingImage()}

        {scrollable ? (
          <SafeAreaView
            edges={['left', 'right', 'bottom']}
            // non-tab routes used to be cut in the bottom
            // maybe this fixes it, needs testing
            style={{ flex: bouncingImage ? undefined : 1 }}
            {...safeAreaProps}
          >
            <ScrollView
              ref={ref}
              onScroll={handleScroll}
              alwaysBounceVertical={bounch}
              bounces={bounch}
              overScrollMode={bounch ? 'auto' : 'never'}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{
                paddingBottom: isTab ? TAB_BAR_HEIGHT : 0,
              }}
              {...scrollViewProps}
            >
              {renderContent()}
            </ScrollView>
          </SafeAreaView>
        ) : (
          <View
            style={{
              flex: 1,
              paddingBottom: isTab || !scrollable ? TAB_BAR_HEIGHT : 0,
            }}
          >
            {renderContent()}
          </View>
        )}
      </>
    );
  }
);

export default Frame;
