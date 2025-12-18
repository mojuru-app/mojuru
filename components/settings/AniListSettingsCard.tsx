import { userInfoAtom } from '@/atoms';
import { BORDER_RADIUS } from '@/constants/Utils';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { hapticVibrate } from '@/modules/utils/haptics';
import { useAtomValue } from 'jotai';
import { CloudUpload, LoaderCircle, LogIn, LogOut } from 'lucide-react-native';
import { Alert, TouchableOpacity } from 'react-native';

import { Value } from '../ui/OptionsModal';
import Txt from '../ui/Txt';
import SettingsItem from './SettingsItem';
import SettingsItemsGroup from './SettingsItemsGroup';

const AniListSettingsItemsGroup = () => {
  const { store, setStoreItem } = useStore();
  const { loginWithAniList, logoutOfAniList, isLoggedInWithAniList } = useAniListAuth();
  const { theme } = useTheme();

  const userInfoAtomValue = useAtomValue(userInfoAtom);

  const handleLogout = async () => {
    hapticVibrate();
    Alert.alert(
      'Log Out of AniList',
      'Are you sure you want to log out of AniList? You will need to log in again to access your account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: async () => {
            logoutOfAniList();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAnilistSyncEnabledUpdate = async (value: boolean) => {
    await setStoreItem('anilistSyncEnabled', value);
  };

  const handleEpisodeProgressThresholdUpdate = async (value: Value) => {
    await setStoreItem('episodeProgressThreshold', value as number);
  };

  return (
    <>
      {isLoggedInWithAniList ? (
        <>
          <SettingsItemsGroup
            label={'anilist'}
            description="Let AniList automatically track your progress as you browse and watch."
          >
            <SettingsItem
              label={userInfoAtomValue?.name ?? ''}
              imageUri={userInfoAtomValue?.avatar?.medium}
              customRight={
                <TouchableOpacity
                  onPress={handleLogout}
                  activeOpacity={0.5}
                  style={{
                    flexDirection: 'row',
                    gap: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: BORDER_RADIUS * 2,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: `${theme.alert.toString()}10`,
                  }}
                >
                  <LogOut size={14} color={theme.alert} />
                  <Txt style={{ color: theme.alert }}>Logout</Txt>
                </TouchableOpacity>
              }
            />
            <SettingsItem
              Icon={CloudUpload}
              label="Sync automatically"
              toggle={{
                value: store.anilistSyncEnabled,
                onChange: handleAnilistSyncEnabledUpdate,
              }}
            />
          </SettingsItemsGroup>
          <SettingsItemsGroup
            description={`Set the percentage of an episode that must be watched before it's marked as completed.`}
          >
            <SettingsItem
              label="Episode progress threshold"
              Icon={LoaderCircle}
              select={{
                options: [
                  { label: '65%', value: 65 },
                  { label: '70%', value: 70 },
                  { label: '75%', value: 75 },
                  { label: '80%', value: 80 },
                  { label: '85%', value: 85 },
                  { label: '90%', value: 90 },
                  { label: '95%', value: 95 },
                  { label: '100%', value: 100 },
                ],
                headingText: 'Threshold',
                defaultValue: store.episodeProgressThreshold,
                onChange: handleEpisodeProgressThresholdUpdate,
                closeOnChange: true,
              }}
            />
          </SettingsItemsGroup>
        </>
      ) : (
        <TouchableOpacity
          onPress={() => loginWithAniList()}
          activeOpacity={0.5}
          style={{
            height: 50,
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: BORDER_RADIUS * 2,
            backgroundColor: `${theme.success.toString()}10`,
          }}
        >
          <LogIn size={14} color={theme.success} />
          <Txt style={{ color: theme.success }}>Login with AniList</Txt>
        </TouchableOpacity>
      )}
    </>
  );
};

export default AniListSettingsItemsGroup;
