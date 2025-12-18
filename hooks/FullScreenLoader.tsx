// components/FullScreenLoader.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

type LoaderState = {
  visible: boolean;
  message: string;
  textColor: string;
};

type LoaderControl = {
  showLoader: (message: string, color?: string) => void;
  hideLoader: () => void;
  updateLoader: (message?: string, color?: string) => void;
};

let control: LoaderControl;

export const useFullScreenLoader = (): LoaderControl => {
  if (!control) {
    throw new Error('FullScreenLoader is not mounted. You must render <FullScreenLoader /> at root.');
  }
  return control;
};

const FullScreenLoader = () => {
  const [state, setState] = useState<LoaderState>({
    visible: false,
    message: 'Loading...',
    textColor: '#fff',
  });

  useEffect(() => {
    control = {
      showLoader: (message, color = '#fff') =>
        setState({ visible: true, message, textColor: color }),
      hideLoader: () => setState((s) => ({ ...s, visible: false })),
      updateLoader: (message, color) =>
        setState((s) => ({
          ...s,
          message: message ?? s.message,
          textColor: color ?? s.textColor,
        })),
    };
  }, []);

  if (!state.visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={state.textColor} />
          <Text style={[styles.message, { color: state.textColor }]}>{state.message}</Text>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FullScreenLoader;
