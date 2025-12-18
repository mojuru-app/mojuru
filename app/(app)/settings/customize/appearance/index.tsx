import Frame from '@/components/Frame';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import { Value } from '@/components/ui/OptionsModal';
import { useStore } from '@/hooks/useStore';
import { CaseLower, House, Image, Palette, Sparkle, Torus, Vibrate } from 'lucide-react-native';

export default function AppearanceSettingsScreen() {
  const { store, setStoreItem } = useStore();

  return (
    <Frame
      bigHeading="Appearance"
      showCollapsibleHeader
      collapsibleHeaderText="Appearance"
      backButton
    >
      <SettingsWrapper>
        <SettingsItemsGroup
          label="Theme"
          description="Toggle the option to prefer the media's color over the app's theme color where possible, such as on the media screen, card, or player."
        >
          <SettingsItem
            Icon={Palette}
            label="Change theme"
            route={'/settings/customize/appearance/themes'}
            isPremium
          />
          <SettingsItem
            Icon={House}
            label="Dynamic colors"
            toggle={{
              value: store.dynColors,
              onChange: async (value: boolean) => {
                await setStoreItem('dynColors', value);
              },
            }}
            isPremium
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="App Icon">
          <SettingsItem
            Icon={Image}
            label="Change app icon"
            route={'/settings/customize/appearance/app-icon'}
            isPremium
          />
        </SettingsItemsGroup>

        <SettingsItemsGroup label="Bottom Bar">
          <SettingsItem
            Icon={Sparkle}
            label="Blurred"
            toggle={{
              value: store.tabBarBlur,
              onChange: async (value: boolean) => {
                await setStoreItem('tabBarBlur', value);
              },
            }}
            isPremium
          />
          <SettingsItem
            Icon={Torus}
            label="Icon bounce when pressed"
            toggle={{
              value: store.tabBarIconBounce,
              onChange: async (value: boolean) => {
                await setStoreItem('tabBarIconBounce', value);
              },
            }}
          />
          <SettingsItem
            Icon={Vibrate}
            label="Vibration when pressed"
            toggle={{
              value: store.tabBarHapticEnabled,
              onChange: async (value: boolean) => {
                await setStoreItem('tabBarHapticEnabled', value);
              },
            }}
          />
          <SettingsItem
            Icon={CaseLower}
            label="Label style"
            select={{
              options: [
                { label: 'Show labels on all tabs', value: 'all' },
                { label: 'Show label only on active tab', value: 'activeOnly' },
                { label: 'Show icons only', value: 'none' },
              ],
              headingText: 'Label Style',
              defaultValue: store.tabBarLabelStyle,
              onChange: async (value: Value) => {
                await setStoreItem('tabBarLabelStyle', value);
              },
              closeOnChange: true,
            }}
            isPremium
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
}
