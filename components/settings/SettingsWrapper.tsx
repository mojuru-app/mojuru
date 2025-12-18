import { FRAME_MARGIN } from '@/constants/Utils';
import { View } from 'react-native';
import { ReactNode } from 'react';

const SettingsWrapper = ({ children }: { children: ReactNode }) => {
  return <View style={{ marginHorizontal: FRAME_MARGIN, gap: 30, marginBottom: 30 }}>{children}</View>;
};

export default SettingsWrapper;
