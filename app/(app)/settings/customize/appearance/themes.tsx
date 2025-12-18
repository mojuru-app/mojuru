import Frame from '@/components/Frame';
import { AvailableThemes, Colors, ColorsDescriptions, ThemeColor } from '@/constants/Colors';
import { BORDER_RADIUS, FRAME_MARGIN } from '@/constants/Utils';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { hapticVibrate } from '@/modules/utils/haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ThemesSettingsScreen() {
  const { store, setStoreItem } = useStore();
  const { changeTheme } = useTheme();

  const handleSelect = async (filter: [string, ThemeColor]) => {
    hapticVibrate();
    await setStoreItem('theme', filter[0]);
    changeTheme(filter[0] as AvailableThemes);
  };

  return (
    <Frame isTab bigHeading="Theme" showCollapsibleHeader collapsibleHeaderText="Themes" backButton>
      <View style={{ marginHorizontal: FRAME_MARGIN, gap: 10 }}>
        {Object.entries(Colors).map(([themeName, themeColors], index) => {
          return (
            <ThemeItem
              key={index}
              item={[themeName, themeColors]}
              selectedFilter={store.theme}
              handleSelect={handleSelect}
            />
          );
        })}
      </View>
    </Frame>
  );
}

export const ThemeItem: React.FC<{
  item: [string, ThemeColor];
  selectedFilter: string;
  handleSelect?: (filter: [string, ThemeColor]) => void;
  disabled?: boolean;
}> = ({ item, selectedFilter, handleSelect, disabled }) => {
  const { theme } = useTheme();

  const themeName = item[0];
  const themeColors = item[1];

  const isSelected = item[0] === selectedFilter;

  const pieceSize = 16;

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 0 : 0.5}
      onPress={() => handleSelect && handleSelect(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 67,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS * 2,
        borderWidth: 1,
        borderColor: isSelected ? themeColors.primary : theme.foreground,
        backgroundColor: isSelected ? `${themeColors.primary.toString()}20` : theme.foreground,
      }}
      disabled={disabled}
    >
      <View
        style={{
          width: pieceSize * 3,
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 6,
        }}
      >
        <View
          style={{
            width: pieceSize * 3,
            height: (pieceSize * 3) / 1.618,
            backgroundColor: themeColors.primary,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              width: pieceSize,
              height: pieceSize,
              backgroundColor: themeColors.background,
            }}
          />
          <View
            style={{
              width: pieceSize,
              height: pieceSize,
              backgroundColor: themeColors.foreground,
            }}
          />
          <View
            style={{
              width: pieceSize,
              height: pieceSize,
              backgroundColor: themeColors.mist,
            }}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'column',
          gap: 3,
          flex: 1,
        }}
      >
        <Text
          style={{
            color: isSelected ? theme.text : theme.textShy,
            fontFamily: 'SemiBold',
            fontSize: 15,
          }}
        >
          {themeName}
        </Text>

        <Text
          style={{
            color: isSelected ? theme.textSupporting : theme.textShy,
            fontFamily: 'Regular',
            fontSize: 12,
            flexWrap: 'wrap',
            textAlign: 'left',
            maxWidth: '95%',
          }}
        >
          {ColorsDescriptions[themeName as AvailableThemes]}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
