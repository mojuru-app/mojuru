import useTheme from '@/hooks/useTheme';
import React, { forwardRef } from 'react';
import { Text, TextProps } from 'react-native';

const Txt = forwardRef<Text, TextProps>(({ style, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <Text
      ref={ref}
      style={[
        {
          fontFamily: "Regular",
          fontSize: 16,
          color: theme.text,
          fontWeight: "300",
          letterSpacing: -0.5,
        },
        style,
      ]}
      {...props}
    />
  );
});

export default Txt;
