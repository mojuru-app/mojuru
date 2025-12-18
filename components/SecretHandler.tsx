import { useStore } from '@/hooks/useStore';

import React, { useRef, useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import SecretDialog from './SecretDialog';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import { userInfoAtom } from '@/atoms';
import { useAtomValue } from 'jotai';

type SecretHandlerProps = {
  children: React.ReactNode;
  tapThresholdMs?: number;
  tapCountRequired?: number;
};

const SecretHandler: React.FC<SecretHandlerProps> = ({
  children,
  tapThresholdMs = 300,
  tapCountRequired = 8,
}) => {
  const { isLoggedInWithAniList } = useAniListAuth();
  const userInfo = useAtomValue(userInfoAtom);
  const { hasPremiumFeatures } = useStore();

  const [secretDialogVisible, setSecretDialogVisible] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = useRef<number>(0);

  const secretAction = () => {
    if (!isLoggedInWithAniList) {
      Alert.alert('Authentication Required', 'You need to authenticate with Anilist first.', [
        { text: 'OK' },
      ]);
    }

    if (!userInfo?.name) {
      Alert.alert(
        'Verification Failed',
        'You are authenticated with Anilist, but your username could not be verified. Please log in again.',
        [{ text: 'OK' }]
      );
    }

    setSecretDialogVisible(true);
  };

  const handlePress = () => {
    if (hasPremiumFeatures) return;

    const now = Date.now();

    if (now - lastTapRef.current < tapThresholdMs) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= tapCountRequired) {
        secretAction();
        setTapCount(0);
        lastTapRef.current = 0;
        return;
      }
    } else {
      setTapCount(1);
    }

    lastTapRef.current = now;
  };

  return (
    <>
      <SecretDialog
        visible={secretDialogVisible}
        onClose={() => setSecretDialogVisible(false)}
        username={userInfo?.name}
      />
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        {children}
      </TouchableOpacity>
    </>
  );
};

export default SecretHandler;
