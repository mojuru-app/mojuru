import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';
import { atom, useAtom } from 'jotai';
import { getAppIcon, setAppIcon } from 'nixa-expo-dynamic-app-icon';
import { Dimensions } from 'react-native';
import useTheme from './useTheme';
import { PremiumSource } from './usePremiumFeatures';

const { width, height } = Dimensions.get('screen');
const deviceWidth = Math.min(width, height);
const deviceHeight = Math.max(width, height);

type Store = Record<string, any>

const defaultValues: Store = {
  // unlocked === true => full features on the free app
  unlocked: false,
  unlockedSource: null,

  // to init store at app launch
  isInitialized: false,

  // auth
  landing: true,
  access_token: null,
  anilist_viewer_id: null,

  // anilist sync
  anilistSyncEnabled: true,
  episodeProgressThreshold: 85, // 75 - 90

  // appearance
  theme: 'Mojuru',
  dynColors: true, // dynamic colors (check hooks/useDynColors)
  tabBarBlur: true,
  tabBarIconBounce: true,
  tabBarHapticEnabled: true,
  tabBarLabelStyle: 'all', // 'all' | 'activeOnly' | 'none'

  // media
  hideDetails: false,

  // player
  useNativeControls: false, // FIXME: NOT WORKING
  autoPiP: false, // FIXME: NOT WORKING
  defaultOrientation: ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
  autoMaxBrightness: false,
  pauseDuringInteractions: true,
  timelineAnimation: 'fade', // slide | fade
  magicSlidersEnabled: true,
  aniSkipEnabled: true,
  displayCustomSkipButton: true,
  defaultSkipTime: 85,

  // subtitles
  subtitlesBottom: 30,
  subtitlesHasBackground: true, // not customizable yet
  subtitlesFontSize: 18,
  subtitlesFontWeight: '400',
  subtitlesTextColor: 'white',
  subtitlesBackgroundColor: '#000000C0',
  subtitlesPaddingRem: 1,
  subtitlesPaddingVertical: 4, // not customizable yet (only indirectly with subtitlesPaddingRem)
  subtitlesPaddingHorizontal: 6, // not customizable yet (only indirectly with subtitlesPaddingRem)
  subtitlesBorderRadius: 4, // not customizable yet
  subtitlesTextAlign: 'center', // not customizable yet
  subtitlesLineHeight: 22,

  // plugin preferences
  showInstallationPluginAlert: true,
  matchCachingEnabled: true,

  // inside only player settings
  volume: 0.5, // 0 - 1.0
  brightness: 0.5, // 0 - 1.0
  playbackRate: 1, // 0 - 16.0
  quality: 'default', // strictly depends on the scrapers

  // general settings
  deviceWidth, // must be used only for the frame bouncing image
  deviceHeight, // must be used only for the frame bouncing image

  /**
   * media episodes progress in seconds
   * sample object:
   *
   * mediaProgress: {
   *  mediaProvider-mediaId: { // like anilist-21
   *   epNumber: {
   *     progress: number,
   *     duration: number
   *   }
   *   ...
   *  }
   * }
   */
  mediaProgress: {},

  /**
   * cache for medias-plugins matches
   * sample object:
   *
   * mediaPluginMatch: {
   *   [pluginName: string]: {
   *     [providerMediaId: string]: Array<{
   *       mediaProvider: string;
   *       mediaId: string;
   *       pluginMedia: MediaResult;
   *     }>;
   *   };
   * }
   */
  mediaPluginCache: {},

  /**
   * plugins: {
   *  pluginsProvider1: [],
   *  pluginsProvider2: [],
   *  ...
   * }
   *
   */
  plugins: {}, // (metadata array)
  activePlugin: null, // Plugin type

  appIcon: getAppIcon(),
};

const storeAtom = atom<Store>(defaultValues);
const storeInitializedAtom = atom(false);

export const useStore = () => {
  const { resetTheme } = useTheme();
  const [store, setStore] = useAtom(storeAtom);
  const [isInitialized, setIsInitialized] = useAtom(storeInitializedAtom);

  const initStore = async (): Promise<Store> => {
    if (isInitialized) return store;

    setIsInitialized(true);
    try {
      console.log('\n\nInitializing store...\n');
      const newStore: Store = { ...defaultValues };

      for (const key of Object.keys(defaultValues)) {
        const storedValue = await AsyncStorage.getItem(key);
        newStore[key] = storedValue !== null ? JSON.parse(storedValue) : defaultValues[key];
      }

      setStore(newStore);
      console.log('\n\nStore ready!\n');
      return newStore
    } catch (error) {
      console.error('Error initializing store:', error);
      throw error
    }
  };

  const resetStoreDefaults = async (options?: {
    exceptions?: string[];
    onlyKeys?: string[];
  }): Promise<Store | undefined> => {
    const exceptions = options?.exceptions ?? [];
    const onlyKeys = options?.onlyKeys;

    try {
      const newStore: Store = { ...store };

      const keysToReset = onlyKeys?.length
        ? onlyKeys
        : Object.keys(defaultValues).filter((key) => !exceptions.includes(key));

      for (const key of keysToReset) {
        const defaultValue = defaultValues[key];
        await setStoreItem(key, defaultValue);
        newStore[key] = defaultValue;
      }
      
      console.log('Store reset completed:', { exceptions, onlyKeys });
      return newStore;
    } catch (error) {
      console.error('Error resetting store:', error);
    }
  };

  const restoreDefaultSettings = async () => {
    const exceptions = [
      'unlocked',
      'unlockedSource',
      'isInitialized',
      // 'landing',
      'access_token',
      'anilist_viewer_id',
      // 'theme',
      'deviceWidth',
      'deviceHeight',
      'mediaProgress',
      'plugins',
      'activePlugin',
    ];

    await resetStoreDefaults({ exceptions });
    resetTheme();
    setAppIcon('mojuru', 'mojuru');
  };

  const restoreDefaultSubtitlesSettings = async () => {
    const subtitleKeys = [
      'subtitlesBottom',
      'subtitlesHasBackground',
      'subtitlesFontSize',
      'subtitlesFontWeight',
      'subtitlesTextColor',
      'subtitlesBackgroundColor',
      'subtitlesPaddingRem',
      'subtitlesPaddingVertical',
      'subtitlesPaddingHorizontal',
      'subtitlesBorderRadius',
      'subtitlesTextAlign',
      'subtitlesLineHeight',
    ];

    await resetStoreDefaults({ onlyKeys: subtitleKeys });
  };

  const restorePremiumSettings = async () => {
    const subtitleKeys = [
      'theme',
      'dynColors',
      'appIcon',
      'tabBarBlur',
      'tabBarLabelStyle',
      'hideDetails',
      'autoMaxBrightness',
      'timelineAnimation',
      'subtitlesBackgroundColor',
      'subtitlesTextColor',
      'subtitlesFontWeight',
      'subtitlesPaddingRem',
    ];

    await resetStoreDefaults({ onlyKeys: subtitleKeys });
    resetTheme();
    setAppIcon('mojuru', 'mojuru');
  };

  const setStoreItem = async (key: keyof typeof defaultValues, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setStore((prev) => ({ ...prev!, [key]: value }));
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  };

  const removeStoreItem = async (key: keyof typeof defaultValues) => {
    try {
      await AsyncStorage.removeItem(key);
      setStore((prev) => {
        const newStore = { ...prev! };
        delete newStore[key];
        return newStore;
      });
    } catch (error) {
      console.error(`Error removing key ${key}:`, error);
    }
  };

  const hasPremiumFeatures = store.unlocked as boolean;

  const unlockPremiumFeatures = async (source: PremiumSource) => {
    await setStoreItem('unlocked', true);
    await setStoreItem('unlockedSource', source)
  };

  const lockPremiumFeatures = async () => {
    await setStoreItem('unlocked', false);
    await setStoreItem('unlockedSource', null)
  };

  return {
    store,
    initStore,
    restoreDefaultSettings,
    restoreDefaultSubtitlesSettings,
    restorePremiumSettings,
    setStoreItem,
    removeStoreItem,
    hasPremiumFeatures,
    unlockPremiumFeatures,
    lockPremiumFeatures,
  };
};

export const getRawStoreItem = async (key: string): Promise<any> => {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValues[key];
  } catch (error) {
    console.error(`Error fetching key ${key}:`, error);
    throw error;
  }
};
