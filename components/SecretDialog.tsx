import env from '@/env.json';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import axios from 'axios';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import Dialog from 'react-native-dialog';

const SecretDialog: React.FC<{
  visible: boolean;
  onClose: () => void;
  username?: string;
}> = ({ visible, onClose, username }) => {
  const { unlockPremiumFeatures } = useStore();
  const { theme } = useTheme();

  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { KEYS_API } = env;

  const handleClose = () => {
    setKey('');
    setLoading(false);
    setError(null);
    onClose();
  };

  const handleRedeem = async () => {
    const isValidKey = (key: string): boolean => {
      // const regex = /^[A-Za-z]{8,16}$/;
      // return regex.test(key);
      return key.length >= 16;
    };

    if (!isValidKey(key)) {
      setError('Key not valid.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        KEYS_API,
        {
          key: key,
          username: username,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      validate(data);
    } catch (err) {
      setError(`Request failed: unusual issue`);
    } finally {
      setLoading(false);
    }
  };

  const validate = (data: any) => {
    if (!data.access) {
      setError(data.message);
      return;
    }

    unlockPremiumFeatures('Key');
    Alert.alert('Key redeemed!', ' You have unlocked premium features!');
    handleClose();
  };

  return (
    <Dialog.Container
      visible={visible}
      onBackdropPress={handleClose}
      blurStyle={{
        backgroundColor: theme.foreground,
      }}
    >
      <Dialog.Title>Redeem Key</Dialog.Title>
      <Dialog.Description>Please enter your activation key below.</Dialog.Description>

      <Dialog.Input
        value={key}
        onChangeText={setKey}
        autoCapitalize="none"
        keyboardType="default"
        editable={!loading}
        autoFocus
        wrapperStyle={{
          backgroundColor: theme.mist,
          borderColor: theme.background,
        }}
      />

      {loading && <Dialog.Description>Loading...</Dialog.Description>}

      {error && <Dialog.Description style={{ color: theme.alert }}>{error}</Dialog.Description>}

      <Dialog.Button label="Cancel" onPress={handleClose} />
      <Dialog.Button label="Redeem" onPress={handleRedeem} disabled={loading} />
    </Dialog.Container>
  );
};

export default SecretDialog;
