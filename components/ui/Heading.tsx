import useTheme from '@/hooks/useTheme';
import React from 'react';

import Txt from './Txt';

const Heading: React.FC<{
  text: string;
  style?: any;
}> = ({ text, style }) => {
  const { theme } = useTheme();
  
  return (
    <Txt
      style={[
        {
          fontFamily: "Bold",
          color: theme.text,
          fontSize: 18,
        },
        style,
      ]}
    >
      {text}
    </Txt>
  );
};

export default Heading;
