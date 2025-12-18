import { Media, MediaListCollection, UserLists } from '@/models/anilist';
import { getRawStoreItem } from '../hooks/useStore';

export const getHeaders = async (accessToken?: string) => {
  const at = accessToken ?? (await getRawStoreItem('access_token'));

  if (at === null)
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

  return {
    Authorization: 'Bearer ' + at,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
};

export const getTitle = (media: Media | undefined): string => {
  return media?.title?.english || media?.title?.romaji || media?.title?.native || '';
};

export const getEpisodes = (media: Media): number | undefined => {
  if (media.episodes != null) {
    return media.episodes;
  }

  if (media.nextAiringEpisode != null) {
    return media.nextAiringEpisode.episode - 1;
  }

  return undefined;
};

export const getAvailableEpisodes = (animeEntry: Media): number => {
  if (animeEntry.nextAiringEpisode != null) {
    return animeEntry.nextAiringEpisode.episode - 1;
  }

  if (animeEntry.episodes != null) {
    return animeEntry.episodes;
  }

  if (animeEntry.airingSchedule?.edges && animeEntry.airingSchedule.edges[0]?.node?.episode) {
    return animeEntry.airingSchedule.edges[0].node.episode;
  }

  return 0;
};

export const convertToUserList = (lists: MediaListCollection['lists']): UserLists => {
  return lists!.reduce((acc, list) => {
    if (list?.entries && list.status) {
      acc[list.status] = list.entries.flatMap((entry) => entry.media ?? ({} as Media));
    }
    return acc;
  }, {} as UserLists);
};
