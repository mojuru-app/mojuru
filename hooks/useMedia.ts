import { mediaAtom } from '@/atoms';
import { MediaData } from '@/models/mediaData';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';

export function useMedia() {
  const mediaState = useAtomValue(mediaAtom);
  const setMedia = useSetAtom(mediaAtom);

  function getMedia(provider: string, id: string | number): MediaData | undefined {
    return useMemo(() => {
      return mediaState?.[provider]?.[id];
    }, [mediaState, provider, id]);
  }

  function ensureMedia(provider: string, media: MediaData): void {
    setMedia((prev) => {
      if (prev[provider]?.[media.id]) return prev;
      return {
        ...prev,
        [provider]: {
          ...(prev[provider] || {}),
          [media.id]: media,
        },
      };
    });
  }

  function setFullMedia(provider: string, media: MediaData): void {
    setMedia((prev) => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [media.id]: media,
      },
    }));
  }

  function updateMedia(provider: string, id: string | number, partial: Partial<MediaData>): void {
    setMedia((prev) => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [id]: {
          ...(prev[provider]?.[id] || {}),
          ...partial,
        },
      },
    }));
  }

  function removeMedia(provider: string, id: string | number): void {
    setMedia((prev) => {
      if (!prev[provider]?.[id]) return prev;
      const { [id]: _, ...rest } = prev[provider];
      return {
        ...prev,
        [provider]: rest,
      };
    });
  }

  function clearMedia(): void {
    setMedia({});
  }

  return {
    getMedia,
    ensureMedia,
    setFullMedia,
    updateMedia,
    removeMedia,
    clearMedia,
  };
}
