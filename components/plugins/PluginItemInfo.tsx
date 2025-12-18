import Txt from '@/components/ui/Txt';
import useTheme from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';

export const PluginItemInfo: React.FC<{
  label: string;
  value?: string;
}> = ({ label, value = 'Unknown' }) => {
  const { theme } = useTheme();

  return (
    <Txt
      style={{
        color: theme.textShy,
        fontFamily: 'SemiBold',
        fontSize: 13,
        flexWrap: 'wrap',
        textAlign: 'left',
        maxWidth: '95%',
      }}
    >
      {`${label}: `}
      <Txt
        style={{
          color: theme.textMuted,
          fontFamily: 'SemiBold',
          fontSize: 13,
          flexWrap: 'wrap',
          textAlign: 'left',
          maxWidth: '95%',
        }}
      >
        {value}
      </Txt>
    </Txt>
  );
};
