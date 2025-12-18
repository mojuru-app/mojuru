import Frame from '@/components/Frame';
import AniListSettingsItemsGroup from '@/components/settings/AniListSettingsCard';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import { Button } from '@/components/ui/Buttons';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { router } from 'expo-router';
import {
  BadgeInfo,
  Clapperboard,
  Crown,
  Palette,
  RefreshCcw,
  Settings2,
  Subtitles,
  TvMinimalPlay,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

const SettingsScreen = () => {
  const { theme } = useTheme();
  const { restoreDefaultSettings } = useStore();
  const { premiumFeatures } = usePremiumFeatures();

  const handleRestoreDefault = () => {
    Alert.alert(
      'Restore Default Settings',
      'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              await restoreDefaultSettings();
              Alert.alert('Settings Restored', 'Settings have been restored to default values.');
            } catch (error) {
              Alert.alert('Unable to Reset', 'Something went wrong while restoring settings.');
            }
          },
        },
      ]
    );
  };

  return (
    <Frame bigHeading="Settings" showCollapsibleHeader collapsibleHeaderText="Settings" isTab>
      <SettingsWrapper>
        {!premiumFeatures && (
          <SettingsItemsGroup
            label="Mojuru Plus"
            description="Gain exclusive benefits by supporting the app!"
          >
            <SettingsItem
              Icon={Crown}
              label="Get Mojuru Plus"
              action={() => {
                router.push('/premium-landing');
              }}
              labelColor={theme.primary}
            />
          </SettingsItemsGroup>
        )}

        <AniListSettingsItemsGroup />

        <SettingsItemsGroup label="Customize">
          <SettingsItem
            Icon={Palette}
            label="Appearance"
            route={'/settings/customize/appearance'}
          />
          {/* <SettingsItem Icon={List} label="Home Sections" route={'/settings/customize/feed'} /> */}
          <SettingsItem Icon={Clapperboard} label="Media" route={'/settings/customize/media'} />
          <SettingsItem Icon={TvMinimalPlay} label="Player" route={'/settings/customize/player'} />
          <SettingsItem
            Icon={Subtitles}
            label="Subtitles"
            route={'/settings/customize/subtitles'}
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Plugins">
          <SettingsItem
            Icon={Settings2}
            label="Preferences"
            route={'/settings/plugins/preferences'}
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="About">
          <SettingsItem Icon={BadgeInfo} label="About" route={'/settings/about'} />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Danger Zone">
          <SettingsItem
            Icon={RefreshCcw}
            label="Restore default settings"
            action={handleRestoreDefault}
            labelColor={theme.alert}
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
};

export default SettingsScreen;
