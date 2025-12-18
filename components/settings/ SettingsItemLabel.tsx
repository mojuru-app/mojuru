import { View, ColorValue } from 'react-native';
import { Image } from 'expo-image';
import { LucideIcon } from 'lucide-react-native';
import useTheme from '@/hooks/useTheme';
import Txt from '../ui/Txt';

const SettingsItemLabel: React.FC<{
  label: string;
  Icon?: LucideIcon;
  imageUri?: string;
  labelColor?: ColorValue;
}> = ({ label, Icon, imageUri, labelColor }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        marginRight: 10,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 8,
      }}
    >
      {Icon && (
        <Icon style={{ alignSelf: 'center' }} color={labelColor ?? theme.textMuted} size={15} />
      )}

      {imageUri && !Icon && (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 100,
            backgroundColor: theme.background,
          }}
        />
      )}

      <Txt
        style={{
          alignSelf: 'center',
          color: labelColor ?? theme.textSupporting,
          fontSize: 15,
          fontFamily: 'Medium',
        }}
        numberOfLines={0}
      >
        {label}
      </Txt>
    </View>
  );
};

export default SettingsItemLabel;
