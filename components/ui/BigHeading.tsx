import useTheme from '@/hooks/useTheme';
import React from 'react';

import Txt from './Txt';
import { FRAME_MARGIN } from '@/constants/Utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BigHeading: React.FC<{
  text: string;
  style?: any;
}> = ({ text, style }) => {
  const { top: topInsets } = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <Txt
      style={[
        {
          fontFamily: 'Bold',
          color: theme.text,
          fontSize: 34,

          // marginTop: FRAME_MARGIN * 4,
          marginTop: FRAME_MARGIN * 2 + topInsets,
          marginBottom: FRAME_MARGIN,
          marginLeft: FRAME_MARGIN,
        },
        style,
      ]}
    >
      {text}
    </Txt>
  );
};

export default BigHeading;
