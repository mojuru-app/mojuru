import { View } from 'react-native';
import Txt from '../ui/Txt';
import useTheme from '@/hooks/useTheme';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

const SettingsFooter = () => {
  const { theme } = useTheme();

  const appName = Application.applicationName ?? 'App';
  const appVersion = Application.nativeApplicationVersion ?? '?.?.?';
  const deviceName = Device.modelName ?? 'Unknown Device';
  const os = `${Device.osName} ${Device.osVersion}`;

  return (
    <View>
      <Txt
        style={{
          alignSelf: 'center',
          color: theme.textMuted,
          fontSize: 13,
          fontFamily: 'Medium',
          textAlign: 'center',
        }}
      >
        {`${appName} v${appVersion} • ${deviceName} • ${os}`}
      </Txt>
    </View>
  );
};

export default SettingsFooter;
