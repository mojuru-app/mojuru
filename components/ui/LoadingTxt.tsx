import React from 'react';
import { ActivityIndicator, View, ViewStyle, StyleProp } from 'react-native';
import Txt from './Txt';

interface LoadingTxtProps {
  loading?: boolean;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textProps?: React.ComponentProps<typeof Txt>;
}

const LoadingTxt = ({ 
  loading = false, 
  children, 
  containerStyle, 
  textProps 
}: LoadingTxtProps) => {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, containerStyle]}>
      {loading && (
        <ActivityIndicator size="small" style={{ marginRight: 6 }} />
      )}
      <Txt {...textProps}>
        {children}
      </Txt>
    </View>
  );
};

export default LoadingTxt;
