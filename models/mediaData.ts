import { Options } from '@/components/ui/OptionsModal';
import {
  FuzzyDate,
  MediaFormat,
  MediaList,
  MediaListStatus,
  MediaStatus,
  MediaTitle,
  RelationType,
} from './anilist';

export interface MediaDataSource {
  provider: MediaProvider;
  /**
   * convert fetched media to MediaData
   *
   * @param rawMedia
   * @returns MediaData
   */
  convert: (rawMedia: any) => MediaData;
  /**
   * convert fetched media array to MediaData array
   *
   * @param rawMediaList
   * @returns MediaData[]
   */
  convertList: (rawMediaList: any[]) => MediaData[];
  /**
   * convert fetched user lists array to UserMediaLists
   *
   * @param rawMediaList
   * @returns UserMediaLists
   */
  convertUserLists: (rawUserMediaLists: any) => UserMediaLists;
  /**
   *
   * @param rawMedia
   * @returns whether to show "New episode" tag on the card
   */
  hasNewEpisode: (rawMedia: any) => boolean;
  fetchEpisodesCovers: (
    ...args: any
  ) => Promise<Record<string, Record<string, MediaEpisodeCover>> | null>;
  needToFetchRelations: boolean;
  fetchRelations: (media: MediaData) => Promise<MediaData[] | undefined>;
  getMediaEpisodesAndOptions: (
    media: MediaData,
    episodeCount: number
  ) => {
    episodes: {
      number: number;
      episodeCover: MediaEpisodeCover | undefined;
    }[];
    options: Options;
  };
}

export type MediaProvider = 'anilist' | 'plugin';

export type UserMediaLists = Partial<Record<MediaListStatus, MediaData[]>>;

export type MediaImage = {
  extraLarge?: string;
  large?: string;
  medium?: string;
};

export type Character = {
  name: string;
  role: string;
  image?: string;
};

export interface MediaData {
  id: string | number;
  idMal?: number;
  provider: MediaProvider;
  // an adapter may need an id, other may need a title. this way it's univeral
  // if undefined, it is assumed that covers cannot exist, even if fetched
  episodesCoversSearchKey?: string | number;
  title: string;
  titles?: MediaTitle;
  relationType?: RelationType;
  synonyms?: string[];
  coverImage?: MediaImage;
  bannerImage?: MediaImage;
  color?: string;
  darkColor?: string;
  darkerColor?: string;
  startDate?: FuzzyDate;
  endDate?: FuzzyDate;
  season?: string;
  tags?: string[];
  genres?: string[];
  description?: string;
  status?: MediaStatus;
  format?: MediaFormat;
  rating?: number;
  duration?: number;
  episodes?: number;
  availableEpisodes?: number;
  mediaListEntry?: MediaList;
  recommendations?: MediaData[];
  characters?: Character[];
  studios?: string[];

  /**
   * anilist returns [] when media has no relations
   * app will make this undefined when a refetch is made.
   * relations refetching is needed when, on a nested media page,
   * relations are not automatically fetched.
   */
  relations?: MediaData[];

  /**
   * {
   *   season-1-id:
   *    1:
   *      ...episodeCover
   *    2:
   *      ...episodeCover
   *   season-2-id:
   * }
   *
   * for anilist media, season is always 1
   */
  episodesCovers?: Record<string, Record<string, MediaEpisodeCover>> | null;
}

export interface MediaEpisodeCover {
  image?: string;
  title?: string;
  summary?: string;
  airdate?: string;
  length?: string | number;
  episodeNumber?: number;
}
