import Frame from '@/components/Frame';
import { TabBarComponent } from '@/components/navigation/TabBarElements';
import { Button } from '@/components/ui/Buttons';
import Heading from '@/components/ui/Heading';
import Txt from '@/components/ui/Txt';
import { Colors } from '@/constants/Colors';
import {
  APP_ICON_PATH,
  BORDER_RADIUS,
  FRAME_MARGIN,
  ICON_IMAGES,
  MOJURU_PLUS_URL,
} from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { openUrlWithConfirmation } from '@/modules/utils/link';
import { darkenColor } from '@/modules/utils/color';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Blocks, Bookmark, Cog, House, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeItem } from './settings/customize/appearance/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PremiumLandingScreen() {
  const { bottom } = useSafeAreaInsets();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'Home' | 'Search' | 'Library' | 'Plugins' | 'Settings'
  >('Home');

  const bottomInsets = bottom + FRAME_MARGIN;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Frame
        collapsibleHeaderHeight={140}
        showCollapsibleHeader
        collapsibleHeaderText="Mojuru Plus"
        modalBackButton
      >
        <ImageBackground
          source={APP_ICON_PATH}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH / 1.3,
            position: 'relative',
          }}
          resizeMode="cover"
        >
          <BlurView intensity={80} style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}>
            <LinearGradient
              colors={['transparent', theme.background.toString()]}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
          </BlurView>

          <View
            style={{
              position: 'absolute',
              top: 45,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <Image
              source={APP_ICON_PATH}
              style={{
                width: 120,
                height: 120,
                borderRadius: 24,
                marginBottom: 12,
              }}
              contentFit="contain"
            />
            <Txt style={{ fontSize: 30, fontFamily: 'Bold', marginBottom: 4 }}>Mojuru Plus</Txt>
          </View>
        </ImageBackground>

        <View
          style={{
            paddingHorizontal: FRAME_MARGIN,
            paddingBottom: bottomInsets,
            transform: [{ translateY: -70 }],
          }}
        >
          <View style={{ flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Heading text="Enjoy extra perks as a supporter!" />

            <Txt
              style={{
                color: theme.textShy,
                fontSize: 14,
                lineHeight: 18,
                textAlign: 'center',
                marginBottom: 34,
              }}
            >
              By supporting Mojuru, you help us grow and improve every day. As a thank-you, Mojuru
              Plus gives you exclusive features and bonuses designed just for you.
            </Txt>
          </View>

          <Txt
            style={{
              marginBottom: 20,
              color: theme.textMuted,
              fontSize: 14,
              fontFamily: 'Medium',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Features
          </Txt>

          <View style={{ marginBottom: 24 }}>
            <BenefitItem
              text="Change app themes"
              description="Switch between different color themes to match your style and mood."
            >
              <View style={{ gap: 10 }}>
                <ThemeItem item={['Akuse', Colors['Akuse']]} selectedFilter={''} disabled />
                <ThemeItem
                  item={['Morningcrust', Colors['Morningcrust']]}
                  selectedFilter={''}
                  disabled
                />
                <ThemeItem item={['Amoled', Colors['Amoled']]} selectedFilter={''} disabled />
              </View>
            </BenefitItem>

            <BenefitItem
              text="Customize app icons"
              description="Choose from a variety of app icons to personalize your home screen."
            >
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                {Object.values(ICON_IMAGES).map((path: any, index: any) => (
                  <Image
                    key={index}
                    source={path}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                    }}
                    contentFit="contain"
                  />
                ))}
              </View>
            </BenefitItem>

            <BenefitItem
              text="Customize the bottom bar"
              description="Choose between blurred backgrounds, icons only, or icons with labels for the bottom bar."
            >
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <TabBarComponent
                  Icon={House}
                  focused={activeTab === 'Home'}
                  title="Home"
                  onPress={() => setActiveTab('Home')}
                />
                <TabBarComponent
                  Icon={Search}
                  focused={activeTab === 'Search'}
                  title="Search"
                  focusedEffect="stroke"
                  onPress={() => setActiveTab('Search')}
                />
                <TabBarComponent
                  Icon={Bookmark}
                  focused={activeTab === 'Library'}
                  title="Library"
                  onPress={() => setActiveTab('Library')}
                />
                <TabBarComponent
                  Icon={Blocks}
                  focused={activeTab === 'Plugins'}
                  title="Plugins"
                  onPress={() => setActiveTab('Plugins')}
                />
                <TabBarComponent
                  Icon={Cog}
                  focused={activeTab === 'Settings'}
                  title="Settings"
                  focusedEffect="stroke"
                  onPress={() => setActiveTab('Settings')}
                />
              </View>
            </BenefitItem>

            <BenefitItem
              text="Take customization further"
              description="Unlock additional layout options, styles, and features like Picture-in-Picture mode."
            />

            <BenefitItem
              text="Support Mojuru's development!"
              description="Help us keep improving Mojuru, fix bugs, and add new features with your support."
              showSeparator={false}
            />
          </View>

          <Txt
            style={{
              margin: 'auto',
              fontSize: 13,
              fontFamily: 'Light',
              color: theme.textMuted,
              textAlign: 'center',
              marginTop: 40,
              width: '75%',
            }}
          >
            Mojuru Plus is activated via a minimum €5 donation through Ko-fi.{'\n'}An AniList
            account is also required to complete the activation.{'\n'}Click the button below to
            learn more.
          </Txt>
        </View>
      </Frame>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          paddingBottom: bottomInsets,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          // backgroundColor: theme.background,
          paddingHorizontal: FRAME_MARGIN,
          paddingTop: 10,
        }}
      >
        {/* <LinearGradient
          colors={['transparent', theme.background.toString()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: -150,
            left: 0,
            right: 0,
            height: 220,
            zIndex: 0,
          }}
          pointerEvents="none"
        /> */}
        <Button
          title="Get Mojuru Plus Now"
          type="primary"
          onPress={async () => {
            openUrlWithConfirmation(MOJURU_PLUS_URL);
          }}
          style={{ zIndex: 1 }}
        />
      </View>
    </View>
  );
}

const BenefitItem: React.FC<{
  text: string;
  description: string;
  children?: React.ReactNode;
  showSeparator?: boolean;
  isSoon?: boolean;
}> = ({ text, description, children, showSeparator = true, isSoon }) => {
  const { theme } = useTheme();
  const primary = Colors['Mojuru'].primary;

  return (
    <View
      style={[
        {
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Heading text={text} />

        {isSoon && (
          <Txt
            style={{
              fontSize: 12,
              paddingHorizontal: 4,
              paddingVertical: 2,
              color: primary,
              backgroundColor: darkenColor(primary.toString(), 12),
              borderRadius: BORDER_RADIUS,
            }}
          >
            SOON
          </Txt>
        )}
      </View>

      <Txt
        style={{
          color: theme.textShy,
          fontSize: 14,
          lineHeight: 18,
          textAlign: 'center',
        }}
      >
        {description}
      </Txt>

      {children && <View style={{ width: '100%', marginTop: 12 }}>{children}</View>}

      {showSeparator && (
        <View
          style={{
            width: '75%',
            height: 2,
            backgroundColor: theme.foreground,
            borderRadius: BORDER_RADIUS,

            marginVertical: 40,
          }}
        />
      )}
    </View>
  );
};
