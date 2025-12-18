import Frame from '@/components/Frame';
import Txt from '@/components/ui/Txt';
import { FRAME_MARGIN, LICENSES } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function LicenseDetail() {
  const {
    name,
  }: Required<{
    name: string;
  }> = useLocalSearchParams();

  const { theme } = useTheme();

  const licenseTxt = LICENSES[name];

  return (
    <Frame bigHeading={`${name} License`} showCollapsibleHeader collapsibleHeaderText={`${name} License`} backButton>
      <View style={{ marginHorizontal: FRAME_MARGIN, marginBottom: FRAME_MARGIN * 3 }}>
        <Txt style={{ fontFamily: 'monospace', color: theme.textShy }}>{licenseTxt}</Txt>
      </View>
    </Frame>
  );
}
