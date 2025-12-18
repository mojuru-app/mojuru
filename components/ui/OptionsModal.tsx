import useTheme from '@/hooks/useTheme';
import { hapticVibrate } from '@/modules/utils/haptics';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';

import { IconCircleButton } from './Buttons';
import ModalBlurWrapper from './ModalBlurWrapper';
import Txt from './Txt';

export type Value = string | number;

export type Options = Array<{
  label: string;
  value: Value;
}>;

const OptionsModal: React.FC<{
  visible: boolean;

  options: Options;
  defaultValue: Value;
  onClose: () => void;

  closeOnChange?: boolean;
  onChange: (newValue: Value) => void;
}> = ({ visible, options, defaultValue, onClose, closeOnChange = false, onChange }) => {
  const { height } = Dimensions.get('window');
  const { theme } = useTheme();

  const [selectedValue, setSelectedValue] = useState<Value>(defaultValue);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const handleOptionPress = (value: Value) => {
    hapticVibrate();
    setSelectedValue(value);
    onChange(value);
    if (closeOnChange) onClose();
  };

  return (
    <ModalBlurWrapper visible={visible} onClose={onClose}>
      <View
        style={{
          flex: 1,
          position: 'relative',
        }}
      >
        <FlatList
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: [{ translateX: '-50%' }],
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 15,
            paddingVertical: height * 0.3,
          }}
          data={options}
          keyExtractor={(item) => String(item.value)}
          renderItem={({ item: option }) => (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => handleOptionPress(option.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Txt
                style={{
                  fontFamily: selectedValue === option.value ? 'SemiBold' : 'Regular',
                  fontSize: 18,
                  color: selectedValue === option.value ? theme.text : theme.textShy,
                }}
              >
                {option.label}
              </Txt>
            </TouchableOpacity>
          )}
        />
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          width: '100%',
          transform: [{ translateX: '-50%' }],
          zIndex: 100,
          justifyContent: 'center',
        }}
      >
        <IconCircleButton
          Icon={X}
          largerTouchArea
          sizeBias={12}
          onPress={() => {
            onClose();
          }}
        />
      </View>
    </ModalBlurWrapper>
  );
};

export default OptionsModal;
