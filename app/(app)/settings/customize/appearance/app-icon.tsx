import Frame from '@/components/Frame';
import { APP_ICONS, BORDER_RADIUS, FRAME_MARGIN, ICON_IMAGES } from '@/constants/Utils';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { capitalizeFirst } from '@/modules/utils/utils';
import { hapticVibrate } from '@/modules/utils/haptics';
import { Image } from 'expo-image';
import { RotateCcw } from 'lucide-react-native';
import { setAppIcon } from 'nixa-expo-dynamic-app-icon';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function AppIconSettingsScreen() {
  const { store, setStoreItem } = useStore();
  const { theme } = useTheme();

  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (iconName: (typeof APP_ICONS)[number]) => {
    try {
      hapticVibrate();
      setAppIcon(iconName, 'mojuru');
      await setStoreItem('appIcon', iconName);
      setError(null);

      Alert.alert(
        'Icon changed!',
        `Mojuru app icon has been set to "${capitalizeFirst(iconName)}".`
      );
    } catch (e) {
      console.error(e);
      setError('Failed to set app icon.');
    }
  };

  return (
    <Frame
      isTab
      bigHeading="App Icon"
      showCollapsibleHeader
      collapsibleHeaderText="App Icons"
      rightIcons={[
        {
          icon: RotateCcw,
          onPress: () => {
            handleSelect('mojuru');
          },
          accent: theme.alert,
        },
      ]}
      backButton
    >
      <View style={{ marginHorizontal: FRAME_MARGIN, gap: 10 }}>
        {APP_ICONS.map((iconName, index) => (
          <AppIconItem
            key={index}
            iconName={iconName}
            isSelected={store.appIcon === iconName}
            onSelect={handleSelect}
          />
        ))}
        {error && <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text>}
      </View>
    </Frame>
  );
}

const AppIconItem: React.FC<{
  iconName: string;
  isSelected: boolean;
  onSelect: (name: (typeof APP_ICONS)[number]) => void;
}> = ({ iconName, isSelected, onSelect }) => {
  const { theme } = useTheme();

  const txt = isSelected ? theme.text : theme.textShy;
  const bg = isSelected ? theme.mist : theme.foreground;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => onSelect(iconName as any)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 67,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS * 2,
        borderWidth: 1,
        borderColor: bg,
        backgroundColor: bg,
      }}
    >
      <Image
        source={ICON_IMAGES[iconName]}
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          backgroundColor: theme.mist,
        }}
      />
      <Text
        style={{
          color: txt,
          fontFamily: 'SemiBold',
          fontSize: 15,
        }}
      >
        {capitalizeFirst(iconName)}
      </Text>
    </TouchableOpacity>
  );
};
