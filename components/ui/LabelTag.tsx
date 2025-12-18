import React from 'react';
import { ColorValue, TextStyle, View, ViewStyle } from 'react-native';
import Txt from '../ui/Txt';
import { BORDER_RADIUS } from '@/constants/Utils';
import { LucideIcon } from 'lucide-react-native';

interface LabelTagProps {
  text: string;
  textColor: ColorValue;
  bgColor: ColorValue;
  Icon?: LucideIcon;
  iconProps?: {
    size?: number;
    color?: ColorValue;
    fill?: ColorValue;
  };
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const LabelTag = ({
  text,
  textColor,
  bgColor,
  Icon,
  iconProps,
  style,
  textStyle,
}: LabelTagProps) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          backgroundColor: bgColor,
          paddingVertical: 4,
          paddingHorizontal: 7,
          borderRadius: BORDER_RADIUS,
        },
        style,
      ]}
    >
      {Icon && <Icon {...iconProps} />}
      <Txt
        style={[
          {
            fontSize: 14,
            fontFamily: 'SemiBold',
            color: textColor,
          },
          textStyle,
        ]}
      >
        {text}
      </Txt>
    </View>
  );
};

export default LabelTag;
