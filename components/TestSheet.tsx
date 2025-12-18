import React, { useEffect } from 'react';
import { View } from 'react-native';
import ActionSheet, { registerSheet } from 'react-native-actions-sheet';

import Txt from './ui/Txt';

const TestSheet: React.FC<{ payload: any }> = ({ payload }) => {
  return (
    <ActionSheet id="test-sheet">
      <View>
        <Txt>Hello World</Txt>
      </View>
    </ActionSheet>
  );
};

registerSheet('test-sheet', TestSheet);

export default TestSheet;
