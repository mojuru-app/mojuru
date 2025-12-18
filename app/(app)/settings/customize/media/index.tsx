import Frame from '@/components/Frame';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import { useStore } from '@/hooks/useStore';
import { Palette, House, Images } from 'lucide-react-native';

export default function CustomizeMediaSettingsScreen() {
  const { store, setStoreItem } = useStore();

  return (
    <Frame bigHeading="Media" showCollapsibleHeader collapsibleHeaderText="Media" backButton>
      <SettingsWrapper>
        <SettingsItemsGroup description="Toggle the option to display episode thumbnails, titles, and descriptions where available. Disable to simplify the display and avoid potential spoilers.">
          <SettingsItem
            Icon={Images}
            label="Hide episode details"
            toggle={{
              value: store.hideDetails,
              onChange: (value: boolean) => setStoreItem('hideDetails', value),
            }}
            isPremium
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
}
