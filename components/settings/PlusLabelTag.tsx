// components/badges/PlusIcon.tsx
import React from 'react';
import useTheme from '@/hooks/useTheme';
import { Crown } from 'lucide-react-native';
import LabelTag from '../ui/LabelTag';


const PlusLabelTag = ({ isPlus = false }: { isPlus?: boolean }) => {
  const { theme } = useTheme();

  const textColor = isPlus ? theme.primary : theme.textShy;
  const bgColor = isPlus ? `${textColor.toString()}10` : theme.mist;

  return (
    <LabelTag
      text={isPlus ? 'Plus' : 'Free'}
      textColor={textColor}
      bgColor={bgColor}
      Icon={isPlus ? Crown : undefined}
      iconProps={{ size: 14, color: textColor, fill: textColor }}
    />
  );
};

export default PlusLabelTag;
