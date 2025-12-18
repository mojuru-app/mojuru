import Frame from '@/components/Frame';
import SettingsItem from '@/components/settings/SettingsItem';
import SettingsItemsGroup from '@/components/settings/SettingsItemsGroup';
import SettingsWrapper from '@/components/settings/SettingsWrapper';
import { Value } from '@/components/ui/OptionsModal';
import { useStore } from '@/hooks/useStore';
import * as ScreenOrientation from 'expo-screen-orientation';
import { CirclePause, Clock, PanelBottomDashed, Ratio, SkipForward, SlidersVertical, Sun } from 'lucide-react-native';

export default function PlayerSettingsScreen() {
  const { store, setStoreItem } = useStore();

  return (
    <Frame bigHeading="Player" showCollapsibleHeader collapsibleHeaderText="Player" backButton>
      <SettingsWrapper>
        <SettingsItemsGroup
          label="General"
          description="Automatically pause the video when interacting with player menus or settings."
        >
          <SettingsItem
            label="Default Orientation"
            Icon={Ratio}
            select={{
              options: [
                { label: 'Left', value: ScreenOrientation.OrientationLock.LANDSCAPE_LEFT },
                { label: 'Right', value: ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT },
                { label: 'Automatic', value: ScreenOrientation.OrientationLock.LANDSCAPE },
              ],
              headingText: 'Orientation',
              defaultValue: store.defaultOrientation,
              onChange: async (value: Value) => {
                await setStoreItem('defaultOrientation', value as number);
              },
              closeOnChange: true,
            }}
          />
          <SettingsItem
            label="Auto max brightness"
            Icon={Sun}
            toggle={{
              value: store.autoMaxBrightness,
              onChange: async (value: boolean) => {
                await setStoreItem('autoMaxBrightness', value);
              },
            }}
            isPremium
          />
          <SettingsItem
            Icon={CirclePause}
            label="Pause during interactions"
            toggle={{
              value: store.pauseDuringInteractions,
              onChange: async (value: boolean) => {
                await setStoreItem('pauseDuringInteractions', value);
              },
            }}
          />
        </SettingsItemsGroup>
        <SettingsItemsGroup
          description={`Choose how the timeline and controls appear: 'Fade' for a smooth dissolve, or 'Slide' for a bottom-to-top effect.`}
        >
          <SettingsItem
            label="Timeline animation"
            Icon={PanelBottomDashed}
            select={{
              options: [
                { label: 'Slide', value: 'slide' },
                { label: 'Fade', value: 'fade' },
              ],
              headingText: 'Timeline Animation',
              defaultValue: store.timelineAnimation,
              onChange: async (value: Value) => {
                await setStoreItem('timelineAnimation', value as string);
              },
              closeOnChange: true,
            }}
            isPremium
          />
        </SettingsItemsGroup>
        <SettingsItemsGroup description="Enable two vertical sliders for controlling volume and brightness, that can be activated using gestures.">
          <SettingsItem
            Icon={SlidersVertical}
            label="Magic Sliders"
            toggle={{
              value: store.magicSlidersEnabled,
              onChange: async (value: boolean) => {
                await setStoreItem('magicSlidersEnabled', value);
              },
            }}
          />
        </SettingsItemsGroup>
        {/* <SettingsItemsGroup label="PiP" description="Automatically enable Picture-in-Picture when leaving the app.">
          <SettingsItem
            Icon={PictureInPicture2}
            label="Auto PiP in background"
            toggle={{
              value: store.autoPiP,
              onChange: async (value: boolean) => {
                await setStoreItem('autoPiP', value);
              },
            }}
            isPremium
          />
        </SettingsItemsGroup> */}
        {/* <SettingsItemsGroup label="Subtitles">
          <SettingsItem
            Icon={Subtitles}
            label="Style"
            route={"/player/subtitles"}
          />
        </SettingsItemsGroup> */}
        <SettingsItemsGroup
          label="AniSkip"
          description="Toggles the visibility of a custom skip button when no AniSkip segments are available."
        >
          <SettingsItem
            Icon={SkipForward}
            label="AniSkip"
            toggle={{
              value: store.aniSkipEnabled,
              onChange: async (value: boolean) => {
                await setStoreItem('aniSkipEnabled', value);
              },
            }}
          />
          <SettingsItem
            Icon={SkipForward}
            label="Custom skip button"
            toggle={{
              value: store.displayCustomSkipButton,
              onChange: async (value: boolean) => {
                await setStoreItem('displayCustomSkipButton', value);
              },
            }}
          />
        </SettingsItemsGroup>
        <SettingsItemsGroup>
          <SettingsItem
            label="Custom skip duration"
            Icon={Clock}
            select={{
              options: [
                { label: '65s', value: 65 },
                { label: '70s', value: 70 },
                { label: '75s', value: 75 },
                { label: '80s', value: 80 },
                { label: '85s', value: 85 },
                { label: '90s', value: 90 },
                { label: '95s', value: 95 },
                { label: '100s', value: 100 },
              ],
              headingText: 'Skip Time',
              defaultValue: store.defaultSkipTime,
              onChange: async (value: Value) => {
                await setStoreItem('defaultSkipTime', value as number);
              },
              closeOnChange: true,
            }}
          />
        </SettingsItemsGroup>
      </SettingsWrapper>
    </Frame>
  );
}
