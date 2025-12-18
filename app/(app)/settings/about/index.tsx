import { userInfoAtom } from '@/atoms';
import Frame from '@/components/Frame';
import SecretDialog from '@/components/SecretDialog';
import PlusLabelTag from '@/components/settings/PlusLabelTag';
import SettingsFooter from '@/components/settings/SettingsFooter';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import Txt from '@/components/ui/Txt';
import {
  APP_ICON_PATH,
  DISCORD_CHANNEL_URL,
  GITHUB_REPO_URL,
  HELP_URL,
  REPORT_ISSUE_URL,
  WEBSITE_URL,
} from '@/constants/Utils';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { capitalizeFirst } from '@/modules/utils/utils';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useAtomValue } from 'jotai';
import {
  BadgeCheck,
  Bug,
  CircleHelp,
  Code,
  Copyright,
  Github,
  Globe,
  Headset,
  Image as ImageIcon,
  Key,
  Palette,
  ShieldCheck,
  StarOff,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export default function AboutSettingsScreen() {
  const { premiumFeatures, source: premiumSource } = usePremiumFeatures();
  const { isLoggedInWithAniList } = useAniListAuth();
  const { store, lockPremiumFeatures, restorePremiumSettings } = useStore();
  const userInfo = useAtomValue(userInfoAtom);
  const { theme } = useTheme();

  const [secretDialogVisible, setSecretDialogVisible] = useState<boolean>(false);

  const version = Constants.expoConfig?.version || 'N/A';

  const handleRedeemKey = () => {
    if (!isLoggedInWithAniList) {
      Alert.alert('Authentication Required', 'You need to authenticate with Anilist first.', [
        { text: 'OK' },
      ]);

      return;
    }

    if (!userInfo?.name) {
      Alert.alert(
        'Verification Failed',
        'You are authenticated with Anilist, but your username could not be verified. Please log in again.',
        [{ text: 'OK' }]
      );

      return;
    }

    setSecretDialogVisible(true);
  };

  const handleRestoreFreeVersion = () => {
    Alert.alert(
      'Restore Free Version',
      'Are you sure you want to disable premium features and restore the app to the free version? You can unlock premium again anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              await restorePremiumSettings();
              await lockPremiumFeatures();
              Alert.alert('Restored to Free Version', 'Premium features have been disabled.');
            } catch (error) {
              Alert.alert(
                'Unable to Restore',
                'Something went wrong while disabling premium features.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <SecretDialog
        visible={secretDialogVisible}
        onClose={() => setSecretDialogVisible(false)}
        username={userInfo?.name}
      />
      <Frame bigHeading="About" showCollapsibleHeader collapsibleHeaderText="About" backButton>
        <SettingsWrapper>
          <SettingsItemsGroup>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: theme.foreground,
              }}
            >
              <Image
                source={APP_ICON_PATH}
                style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 0 }}
              />
              <View style={{ gap: 2 }}>
                <Txt style={{ fontSize: 18, fontFamily: 'SemiBold', color: theme.text }}>
                  {premiumFeatures ? 'Mojuru Plus' : 'Mojuru'}
                </Txt>
                <Txt style={{ fontSize: 14, color: theme.textShy }}>v{version}</Txt>
              </View>
            </View>

            <SettingsItem
              Icon={BadgeCheck}
              label="App edition"
              customRight={<PlusLabelTag isPlus={premiumFeatures} />}
            />
            <SettingsItem Icon={Palette} label="Active theme" text={store.theme} />
            <SettingsItem
              Icon={ImageIcon}
              label="Active app icon"
              text={capitalizeFirst(store.appIcon)}
            />
          </SettingsItemsGroup>

          <SettingsItemsGroup label="Mojuru Plus">
            {premiumFeatures && (
              <SettingsItem
                Icon={BadgeCheck}
                label="Premium Type"
                text={premiumSource ?? 'Unknown'}
              />
            )}
            <SettingsItem
              Icon={Key}
              label="Redeem key"
              action={handleRedeemKey}
              labelColor={theme.primary}
            />
            {premiumFeatures && (
              <SettingsItem
                Icon={StarOff}
                label="Restore free version"
                action={handleRestoreFreeVersion}
                labelColor={theme.alert}
              />
            )}
          </SettingsItemsGroup>

          <SettingsItemsGroup label="Community & Support">
            <SettingsItem Icon={Headset} label="Discord Channel" link={DISCORD_CHANNEL_URL} />
            <SettingsItem Icon={CircleHelp} label="Help" link={HELP_URL} />
            <SettingsItem Icon={Bug} label="Report an issue" link={REPORT_ISSUE_URL} />
          </SettingsItemsGroup>

          <SettingsItemsGroup label="Resources">
            <SettingsItem Icon={Globe} label="Website" link={WEBSITE_URL} />
            <SettingsItem Icon={Github} label="GitHub Repository" link={GITHUB_REPO_URL} />
          </SettingsItemsGroup>

          <SettingsItemsGroup label="Legal">
            <SettingsItem
              Icon={ShieldCheck}
              label="Privacy Policy"
              link="https://www.mojuru.app/privacy-policy"
            />
            <SettingsItem
              Icon={ShieldCheck}
              label="Terms of Service"
              link="https://www.mojuru.app/terms"
            />
            <SettingsItem
              Icon={Copyright}
              label="License"
              route={{ pathname: '/license/[name]', params: { name: 'Mojuru' } }}
            />
            <SettingsItem Icon={Code} label="Integrations" route="/integrations" />
            <SettingsItem Icon={Copyright} label="Third-Party Licenses" route="/dependencies" />
          </SettingsItemsGroup>

          <SettingsFooter />
        </SettingsWrapper>
      </Frame>
    </>
  );
}
