import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import Dialog from 'react-native-dialog';

type AddPluginDialogProps = {
  visible: boolean;
  onClose: () => void;
};

const AddPluginDialog: React.FC<AddPluginDialogProps> = ({ visible, onClose }) => {
  const { loadPlugin } = usePluginManager();
  const { theme } = useTheme();
  const { store, setStoreItem } = useStore();

  const [pluginUrl, setPluginUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setPluginUrl('');
    setLoading(false);
    setError(null);
    onClose();
  };

  const handleAdd = async () => {
    if (!store.showInstallationPluginAlert) {
      addPlugin();
      return;
    }

    Alert.alert(
      'Security Warning',
      'Please make sure the plugin comes from a trusted source. Installing plugins from external sources may introduce untrusted code and put your device at risk. Proceed with caution.',
      [
        {
          text: "Don't show again",
          onPress: () => {
            setStoreItem('showInstallationPluginAlert', false);
            addPlugin();
          },
        },
        {
          text: 'OK',
          style: 'cancel',
          onPress: addPlugin,
        },
      ]
    );
  };

  const addPlugin = async () => {
    const trimmedUrl = pluginUrl.trim();
    
    if (!trimmedUrl.endsWith('.json')) {
      throw 'Invalid plugin URL';
    }

    setLoading(true);
    setError(null);

    try {
      const metadata = await loadPlugin(trimmedUrl);

      router.push({
        pathname: '/plugin/[pluginId]/info',
        params: {
          pluginId: metadata.name,
          onlyInfo: JSON.stringify(false),
          pluginMetadata: JSON.stringify(metadata),
        },
      });

      handleClose();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Container
      visible={visible}
      onBackdropPress={handleClose}
      blurStyle={{
        backgroundColor: theme.foreground,
      }}
    >
      <Dialog.Title>Add Plugin</Dialog.Title>
      <Dialog.Description>
        Enter the URL of your plugin. It should be a valid JSON file.
      </Dialog.Description>

      <Dialog.Input
        placeholder="https://url.com/plugin.json"
        value={pluginUrl}
        onChangeText={setPluginUrl}
        autoCapitalize="none"
        keyboardType="url"
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
      <Dialog.Button label="Add" onPress={handleAdd} disabled={loading} />
    </Dialog.Container>
  );
};

export default AddPluginDialog;
