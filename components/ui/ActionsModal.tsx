import { MODAL_MARGIN } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { hapticVibrate } from '@/modules/utils/haptics';
import { LucideIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, ScrollView, TouchableOpacity, View } from 'react-native';

import { IconCircleButton } from './Buttons';
import ModalBlurWrapper from './ModalBlurWrapper';
import Txt from './Txt';

export type Value = string | number;

export type Action = {
  Icon: LucideIcon;
  label: string;
  onPress: (...args: any) => void;
};

const ActionsModal: React.FC<{
  visible: boolean;

  topChildren: React.ReactNode;
  actions: Action[];
  onClose: () => void;

  closeOnChange?: boolean;
}> = ({ visible, topChildren, actions, onClose, closeOnChange = false }) => {
  const { height } = Dimensions.get('window');
  const { theme } = useTheme();

  const handleActionPress = (a: Action) => {
    hapticVibrate();
    a.onPress();

    if (closeOnChange) onClose();
  };

  return (
    <ModalBlurWrapper visible={visible} onClose={onClose}>
      <ScrollView>
        <View
          style={{
            flex: 1,
            position: 'relative',
          }}
        >
          <View
            style={{
              marginTop: 100,
              alignItems: 'center',
            }}
          >
            {topChildren}
          </View>

          <FlatList
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 40, marginBottom: 120 }}
            contentContainerStyle={{
              marginHorizontal: MODAL_MARGIN,
              flexDirection: 'column',
              gap: 15,
            }}
            data={actions}
            scrollEnabled={false}
            keyExtractor={(item) => String(item.label)}
            renderItem={({ item: action }) => (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  handleActionPress(action);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <action.Icon color={theme.textShy} size={26} strokeWidth={1.5} />
                <Txt
                  style={{
                    flexWrap: 'wrap',
                    fontFamily: 'SemiBold',
                    fontSize: 15,
                    color: theme.text,
                  }}
                >
                  {action.label}
                </Txt>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

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

export default ActionsModal;
