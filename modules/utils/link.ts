import { Alert, Linking } from 'react-native';

export function openUrlWithConfirmation(url: string) {
  Alert.alert(
    'Opening External Link',
    `Are you sure you want to open this link?\n\n${url}`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open',
        onPress: () => {
          Linking.openURL(url);
        },
      },
    ],
    { cancelable: true }
  );
}
