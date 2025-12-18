import Frame from '@/components/Frame';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import { useMediaMatchCache } from '@/hooks/useMediaMatchCache';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { CircleAlert, Database, Megaphone, Trash2, TriangleAlert } from 'lucide-react-native';
import { Alert } from 'react-native';

export default function PluginPreferencesSettingsScreen() {
  const { clearAllMediaMatches } = useMediaMatchCache();
  const { store, setStoreItem } = useStore();
  const { theme } = useTheme();

  return (
    <Frame
      bigHeading="Preferences"
      showCollapsibleHeader
      collapsibleHeaderText="Preferences"
      backButton
    >
      <SettingsWrapper>
        <SettingsItemsGroup
          label="Installation"
          description="Before installing a plugin, an alert will appear to remind you that installing plugins from external sources carries risks, as they inject code from untrusted origins."
        >
          <SettingsItem
            Icon={Megaphone}
            label="Show installation alert"
            toggle={{
              value: store.showInstallationPluginAlert,
              onChange: (value: boolean) => setStoreItem('showInstallationPluginAlert', value),
            }}
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup
          label="Matching Cache"
          description="When you go to watch an episode, a 'select source' screen appears, where the app searches for a match between the Anilist media and the plugin content. If no match is found, you can manually search. The matching cache remembers your choice, saving you from redoing the search next time. You can delete the cache for each media item individually from its dedicated screen."
        >
          <SettingsItem
            Icon={Database}
            label="Enable Matching Cache"
            toggle={{
              value: store.matchCachingEnabled,
              onChange: (value: boolean) => setStoreItem('matchCachingEnabled', value),
            }}
          />
        </SettingsItemsGroup>
        <SettingsItemsGroup>
          <SettingsItem
            Icon={Trash2}
            label="Clear All Cache"
            labelColor={theme.alert}
            action={() => {
              Alert.alert(
                'Clear Matching Cache',
                'Are you sure you want to clear the cached media matches? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await clearAllMediaMatches();
                        Alert.alert(
                          'Cache Cleared',
                          'All cached media matches have been successfully cleared.'
                        );
                      } catch (error) {
                        Alert.alert(
                          'Error',
                          'Something went wrong while clearing the matching cache.'
                        );
                      }
                    },
                  },
                ]
              );
            }}
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
}
