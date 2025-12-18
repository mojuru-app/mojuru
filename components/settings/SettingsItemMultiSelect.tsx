import useTheme from '@/hooks/useTheme';
import { Check, LucideIcon } from 'lucide-react-native';
import { ColorValue, TouchableOpacity, View } from 'react-native';

import Txt from '../ui/Txt';
import SettingsItemLabel from './ SettingsItemLabel';

export type MultiSelectOption = {
  label: string;
  value: string;
};

const SettingsItemMultiSelect: React.FC<{
  label: string;
  Icon?: LucideIcon;
  imageUri?: string;
  labelColor?: ColorValue;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}> = ({ label, Icon, imageUri, labelColor, options, selectedValues, onChange }) => {
  const { theme } = useTheme();

  const toggleValue = (value: string) => {
    const isSelected = selectedValues.includes(value);
    const newSelected = isSelected ? selectedValues.filter((v) => v !== value) : [...selectedValues, value];
    onChange(newSelected);
  };

  return (
    <View
      style={{
        backgroundColor: theme.foreground,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: theme.mist,
        borderBottomWidth: 1,
      }}
    >
      {/* Multi-select options */}
      <View style={{ gap: 8 }}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => toggleValue(option.value)}
              activeOpacity={0.6}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  marginRight: 10,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: isSelected ? theme.primary : theme.textMuted,
                  backgroundColor: isSelected ? theme.primary : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isSelected && <Check size={14} color={theme.background} />}
              </View>
              <Txt style={{ color: theme.text, fontSize: 15 }}>{option.label}</Txt>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default SettingsItemMultiSelect;
