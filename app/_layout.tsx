import '@/modules/utils/sheets';

import StoreGate from '@/components/StoreGate';
import FullScreenLoader from '@/hooks/FullScreenLoader';
import useTheme from '@/hooks/useTheme';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { SheetProvider } from 'react-native-actions-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.setOptions({ fade: true });

const imagesToCache = [
  require('@/assets/images/icon.png'),
  require('@/assets/images/customIcons/akuse.png'),
  require('@/assets/images/customIcons/saikou.png'),
  require('@/assets/images/customIcons/hollowdeep.png'),
  require('@/assets/images/customIcons/morningcrust.png'),
];

const cacheImages = (images: any[]) => {
  return images.map((image) => Asset.fromModule(image).downloadAsync());
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Thin: require('../assets/fonts/Montserrat-Thin.ttf'),
    ExtraLight: require('../assets/fonts/Montserrat-ExtraLight.ttf'),
    Light: require('../assets/fonts/Montserrat-Light.ttf'),
    Regular: require('../assets/fonts/Montserrat-Regular.ttf'),
    Medium: require('../assets/fonts/Montserrat-Medium.ttf'),
    SemiBold: require('../assets/fonts/Montserrat-SemiBold.ttf'),
    Bold: require('../assets/fonts/Montserrat-Bold.ttf'),
    ExtraBold: require('../assets/fonts/Montserrat-ExtraBold.ttf'),
    Black: require('../assets/fonts/Montserrat-Black.ttf'),
  });

  const { theme } = useTheme();

  const loadResourcesAsync = async () => {
    const imagePromises = cacheImages(imagesToCache);
    await Promise.all([...imagePromises]);
  };

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await loadResourcesAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        // await SplashScreen.hideAsync();
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const onReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!isReady) {
    return null;
  }

  const CustomTheme: Theme = {
    dark: true,
    colors: {
      primary: theme.primary.toString(),
      background: theme.background.toString(),
      card: theme.foreground.toString(),
      text: theme.text.toString(),
      border: theme.mist.toString(),
      notification: 'rgb(255, 69, 58)',
    },
    fonts: {
      regular: {
        fontFamily: 'Regular',
        fontWeight: '500',
      },
      medium: {
        fontFamily: 'Medium',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'Bold',
        fontWeight: '500',
      },
      heavy: {
        fontFamily: 'ExtraBold',
        fontWeight: '500',
      },
    },
  };

  return (
    <ThemeProvider value={CustomTheme}>
      <GestureHandlerRootView>
        <SheetProvider>
          <StatusBar style="light" />

          <FullScreenLoader />

          <StoreGate onReady={onReady}>
            <Slot />
          </StoreGate>
        </SheetProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
