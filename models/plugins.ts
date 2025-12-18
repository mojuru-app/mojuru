import { MediaData } from './mediaData';

export const PLUGINS_PROVIDERS = ['Demo', 'Standard', 'Alternative'] as const;
export type PluginProvider = (typeof PLUGINS_PROVIDERS)[number];

// --- PLUGIN RELATED TYPES ---

/**
 * the plugin metadata
 */
export type PluginMetadata = {
  name: string;
  /**
   * whether the plugin works with the app or no.
   * only if compatible the plugin can be installed, because othwerwise it 100% wouldn't work.
   */
  compatible: boolean;
  pluginType: 'provider' | 'media';
  /**
   * the origin of the plugin
   */
  pluginProvider: PluginProvider;
  /**
   * the actual source of the content provided by the plugin
   */
  contentProvider: string;
  scriptUrl: string;
  iconUrl?: string;
  author?: {
    name?: string;
    icon?: string;
  };
  version?: string;
  language?: string;
  streamType?: string; // "HLS" | "MP4" | string;
  quality?: string;
  baseUrl?: string;
  type?: string; // "anime" | string
  media?: MediaData;
};

/**
 * plugin metadata and script with functions
 *
 * **note**: the script is a js file with functions from the plugins provider. then, these functions returns will be converted to be used inside the app
 *
 */
export type Plugin = {
  metadata: PluginMetadata;
  script: string;
};

// --- MEDIA RELATED TYPES ---

export declare enum MediaStatus {
  FINISHED = 'Finished',
  RELEASING = 'Releasing',
  NOT_YET_RELEASED = 'Not Yet Released',
  CANCELLED = 'Cancelled',
  HIATUS = 'Hiatus',
}

export declare enum MediaFormat {
  TV = 'TV',
  TV_SHORT = 'TV Short',
  MOVIE = 'Movie',
  SPECIAL = 'Special',
  OVA = 'OVA',
  ONA = 'ONA',
  MUSIC = 'Music',
}

export declare enum SubOrDub {
  SUB = 'Sub',
  DUB = 'Dub',
  BOTH = 'Both',
}

export interface Images {
  cover?: string;
  coverMobile?: string;
  logo?: string;
  poster?: string;
  background?: string;
}

export interface FuzzyDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface MediaEpisode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  isFiller?: boolean;
  image?: string;
  releaseDate?: FuzzyDate;
  runtime?: string;
  [x: string]: unknown;
}

export interface MediaSeason {
  id: string;
  number: number;
  title?: string;
  description?: string;
  releaseDate?: FuzzyDate;
  totalEpisodes?: number;
}

export interface Search<T> {
  currentPage?: number;
  hasNextPage?: boolean;
  totalPages?: number;
  totalResults?: number;
  results: T[];
  [x: string]: unknown;
}

export interface MediaResult {
  id: string;
  title: string;
  url?: string;
  image?: string;
  cover?: string;
  status?: MediaStatus;
  rating?: number;
  format?: MediaFormat;
  releaseDate?: FuzzyDate;
  [x: string]: unknown;
}

export interface MediaInfo extends MediaResult {
  hasSeasons: boolean;
  genres?: string[];
  description?: string;
  totalEpisodes?: number;
  totalSeasons?: number;
  subOrDub?: SubOrDub;
  synonyms?: string[];
  color?: string;
  cover?: string;
  banner?: string;
  season?: string;
  episodes?: MediaEpisode[];
  seasons?: MediaSeason[];
  [x: string]: unknown;
}
