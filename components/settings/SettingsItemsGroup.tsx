import { BORDER_RADIUS } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { View } from 'react-native';

import Txt from '../ui/Txt';

const SettingsItemsGroup: React.FC<{
  label?: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => {
  const { theme } = useTheme();

  return (
    <View style={{ gap: 8 }}>
      {label && (
        <Txt
          style={{
            marginLeft: 18,
            color: theme.textMuted,
            fontSize: 12,
            fontFamily: 'SemiBold',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Txt>
      )}

      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          borderRadius: BORDER_RADIUS * 3,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>

      {description && (
        <Txt
          style={{
            marginLeft: 18,
            color: theme.textMuted,
            fontSize: 13,
            fontFamily: 'Medium',
          }}
        >
          {description}
        </Txt>
      )}
    </View>
  );
};

export default SettingsItemsGroup;
