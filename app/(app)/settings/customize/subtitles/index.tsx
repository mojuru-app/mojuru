import Frame from '@/components/Frame';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import SubtitlesOverlay from '@/components/SubtitlesOverlay';
import SubtitlesOverlayLocal from '@/components/SubtitlesOverlayLocal';
import { SAMPLE_IMAGE } from '@/constants/Utils';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import {
  Bold,
  ChevronsDownUp,
  Droplet,
  ListCollapse,
  MoveDown,
  PaintBucket,
  RefreshCcw,
  Text,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image } from 'react-native';

export default function SubtitlesSettingsScreen() {
  const { store, setStoreItem, restoreDefaultSubtitlesSettings } = useStore();
  const { theme } = useTheme();

  const [subtitlesBottom, setSubtitlesBottom] = useState(store.subtitlesBottom);
  const [subtitlesFontSize, setSubtitlesFontSize] = useState(store.subtitlesFontSize);
  const [subtitlesPaddingRem, setSubtitlesPaddingRem] = useState(store.subtitlesPaddingRem);
  const [subtitlesLineHeight, setSubtitlesLineHeight] = useState(store.subtitlesLineHeight);

  const handleRestoreDefaultSubtitles = () => {
    Alert.alert(
      'Restore Subtitle Settings',
      'Are you sure you want to reset all subtitle settings to their default values? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reset Subtitles',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubtitlesBottom(30);
              setSubtitlesFontSize(18);
              setSubtitlesPaddingRem(1);
              setSubtitlesLineHeight(22);
              await restoreDefaultSubtitlesSettings();
              Alert.alert(
                'Subtitles Reset',
                'Subtitle settings have been restored to their default values.'
              );
            } catch (error) {
              Alert.alert(
                'Reset Failed',
                'Something went wrong while resetting subtitle settings.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Frame
      bigHeading="Subtitles"
      showCollapsibleHeader
      collapsibleHeaderText="Subtitles"
      backButton
      rightIcons={[
        {
          icon: RefreshCcw,
          onPress: handleRestoreDefaultSubtitles,
          accent: theme.alert,
        },
      ]}
    >
      <SettingsWrapper>
        <SettingsItemsGroup label="Preview">
          <Image
            source={{ uri: SAMPLE_IMAGE }}
            style={{ width: '100%', height: 200, backgroundColor: theme.primary }}
            resizeMode="cover"
          />
          <SubtitlesOverlayLocal
            activeSubtitle={`The countless dragons that rained down were less significant threats than the humans in the sky`}
            subtitlesBottom={subtitlesBottom}
            subtitlesFontSize={subtitlesFontSize}
            subtitlesPaddingRem={subtitlesPaddingRem}
            subtitlesLineHeight={subtitlesLineHeight}
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Position">
          <SettingsItem
            label="Distance from Bottom"
            slider={{
              min: 0,
              max: 50,
              step: 1,
              value: subtitlesBottom as any,
              unit: 'px',
              onValueChange: (val: any) => setSubtitlesBottom(val),
              onSlidingComplete: async (value: any) => {
                await setStoreItem('subtitlesBottom', value);
              },
            }}
            Icon={MoveDown}
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Style">
          <SettingsItem
            label="Background Color"
            select={{
              options: [
                { label: 'Semi-transparent Black', value: '#000000C0' },
                { label: 'Solid Black', value: '#000000' },
                { label: 'Semi-transparent White', value: '#FFFFFF99' },
                { label: 'Transparent', value: 'transparent' },
              ],
              headingText: 'Subtitle Background Color',
              defaultValue: store.subtitlesBackgroundColor as any,
              onChange: async (value: any) => {
                await setStoreItem('subtitlesBackgroundColor', value);
              },
            }}
            Icon={PaintBucket}
            isPremium
          />

          <SettingsItem
            label="Text Color"
            select={{
              options: [
                { label: 'White', value: 'white' },
                { label: 'Yellow', value: '#FFD700' },
                { label: 'Red', value: '#FF4D4F' },
                { label: 'Green', value: '#52C41A' },
              ],
              headingText: 'Subtitle Text Color',
              defaultValue: store.subtitlesTextColor as any,
              onChange: async (value: any) => {
                await setStoreItem('subtitlesTextColor', value);
              },
            }}
            Icon={Droplet}
            isPremium
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Typography">
          <SettingsItem
            label="Font Size"
            slider={{
              min: 10,
              max: 30,
              step: 1,
              value: subtitlesFontSize as any,
              unit: 'px',
              onValueChange: (val: any) => setSubtitlesFontSize(val),
              onSlidingComplete: async (value: any) => {
                await setStoreItem('subtitlesFontSize', value);
              },
            }}
            Icon={Text}
          />

          <SettingsItem
            label="Font Weight"
            select={{
              options: [
                { label: '100', value: '100' },
                { label: '200', value: '200' },
                { label: '300', value: '300' },
                { label: '400', value: '400' },
                { label: '500', value: '500' },
                { label: '600', value: '600' },
                { label: '700', value: '700' },
                { label: '800', value: '800' },
                { label: '900', value: '900' },
              ],
              headingText: 'Font Weight',
              defaultValue: store.subtitlesFontWeight as any,
              onChange: async (value: any) => {
                await setStoreItem('subtitlesFontWeight', value);
              },
            }}
            Icon={Bold}
            isPremium
          />

          <SettingsItem
            label="Line Height"
            slider={{
              min: 10,
              max: 40,
              step: 1,
              value: subtitlesLineHeight as any,
              unit: 'px',
              onValueChange: (val: any) => setSubtitlesLineHeight(val),
              onSlidingComplete: async (value: any) => {
                await setStoreItem('subtitlesLineHeight', value);
              },
            }}
            Icon={ListCollapse}
          />

          <SettingsItem
            label="Padding"
            slider={{
              min: 1,
              max: 5,
              step: 1,
              value: subtitlesPaddingRem as any,
              unit: 'px',
              onValueChange: (val: any) => setSubtitlesPaddingRem(val),
              onSlidingComplete: async (value: any) => {
                await setStoreItem('subtitlesPaddingRem', value);
              },
            }}
            Icon={ChevronsDownUp}
            isPremium
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Danger Zone">
          <SettingsItem
            Icon={RefreshCcw}
            label="Restore default subtitles"
            action={handleRestoreDefaultSubtitles}
            labelColor={theme.alert}
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
}
