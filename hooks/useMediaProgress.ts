import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from './useStore';

export const useMediaProgress = () => {
  const { store, setStoreItem } = useStore();

  const getMediaEpisodesProgress = (mediaId: string) => {
    return store?.mediaProgress?.[mediaId] || {};
  };

  const setMediaEpisodeProgress = async (
    mediaId: string,
    episodeNumber: number,
    progress: number,
    duration: number
  ) => {
    try {
      const currentProgress = store?.mediaProgress ?? {};

      const updatedMediaProgress = {
        ...currentProgress,
        [mediaId]: {
          ...(currentProgress[mediaId] || {}),
          [episodeNumber]: {
            progress,
            duration,
          },
        },
      };

      await AsyncStorage.setItem('mediaProgress', JSON.stringify(updatedMediaProgress));
      setStoreItem('mediaProgress', updatedMediaProgress);
    } catch (error) {
      console.error(`Error setting progress for media ${mediaId}, episode ${episodeNumber}:`, error);
    }
  };

  return {
    getMediaEpisodesProgress,
    setMediaEpisodeProgress,
  };
};
