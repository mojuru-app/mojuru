import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Modal, View } from 'react-native';

const ModalBlurWrapper: React.FC<{
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}> = ({ visible, onClose, children }) => {
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView
        intensity={85}
        // intensity={70}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width,
          height,
          backgroundColor: '#21212180',
        }}
      />
      <View
        style={{
          width,
          height,
        }}
      >
        {children}
      </View>
    </Modal>
  );
};

export default ModalBlurWrapper;
