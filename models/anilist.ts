import { MediaTypes, RelationTypes } from "@/constants/Anilist";

export type MediaTitle = {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
};

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT"
  // Lazy related stuff (maybe can remove)
  | "SEQUEL"
  | "PREQUEL"
  | "ALTERNATIVE"
  | "SIDE_STORY"
  | "CHARACTER"
  | "SUMMARY";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type FuzzyDate = {
  year?: number;
  month?: number;
  day?: number;
};

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type MediaCoverImage = {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
};

export type LocalMediaCoverImage = {
  extraLarge?: any;
  large?: any;
  medium?: any;
  color?: string;
};

export type AiringPage = {
  airingSchedules: AiringSchedule[];
  pageInfo: PageInfo;
};

export type AiringSchedule = {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
  media?: Media;
};

export type AiringScheduleConnection = {
  edges?: Array<{
    node?: {
      episode: number;
    };
  }>;
};

export type MediaListStatus =
  | "CURRENT"
  | "PLANNING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | "REPEATING";

export type MediaList = {
  id: number;
  mediaId: number;
  status?: MediaListStatus;
  score?: number;
  progress?: number;
  media?: Media;
};

export type MediaTrailer = {
  id?: string;
  site?: string;
  thumbnail?: string;
};

export type PageInfo = {
  total: number;
  currentPage: number;
  hasNextPage: boolean;
};

export type MediaCharacter = {
  id: number;
  name: {
    full: string;
  };
  image: {
    medium: string;
  };
};

export type MediaCharacterEdge = {
  role: string;
  node: MediaCharacter;
};

export type MediaCharacterConnection = {
  edges: MediaCharacterEdge[];
};

export type MediaStudio = {
  id: number;
  name: string;
};

export type MediaStudioEdge = {
  isMain: boolean;
  node: MediaStudio;
};

export type MediaStudioConnection = {
  edges: MediaStudioEdge[];
};


export type RelationType = (typeof RelationTypes)[keyof typeof RelationTypes];

export type Relation = {
  id: number;
  relationType: RelationType;
  node: Media;
};

export type RelationConnection = {
  edges: Relation[];
};

export type Recommend = {
  id: number;
  mediaRecommendation: Media;
};

export type RecommendConnection = {
  nodes: Recommend[];
};

export type MediaType = (typeof MediaTypes)[keyof typeof MediaTypes];

export type Media = {
  id: number;
  type?: MediaType;
  idMal?: number;
  title?: MediaTitle;
  format?: MediaFormat;
  status?: MediaStatus;
  description?: string;
  startDate?: FuzzyDate;
  endDate?: FuzzyDate;
  season?: MediaSeason;
  seasonYear?: number;
  episodes?: number;
  duration?: number;
  coverImage?: MediaCoverImage;
  bannerImage?: string;
  genres?: string[];
  synonyms?: string[];
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  favourites?: number;
  tags?: {
    name: string;
  }[];
  isAdult?: boolean;
  nextAiringEpisode?: AiringSchedule;
  airingSchedule?: AiringScheduleConnection;
  mediaListEntry?: MediaList;
  siteUrl?: string;
  trailer?: MediaTrailer;
  relations?: RelationConnection;
  recommendations?: RecommendConnection;
  characters?: MediaCharacterConnection;
  studios?: MediaStudioConnection;

  // -- NOT FROM API --

  /**
   * note: I don't remember if this stuff is still used somewhere :P
   *
   * set to true if this is a custom media
   * any of the following keys should be used with custom set to true
   */
  custom?: boolean;
  hasSeasons?: boolean;
  localCoverImage?: LocalMediaCoverImage;
  localBannerImage?: any;
  customPlayButton?: React.ReactNode;
  customProvider?: any;
};

export type MediaListCollection = {
  lists?: Array<{
    isCustomList: boolean;
    name: string;
    status: MediaListStatus;
    entries?: MediaList[];
  }>;
};

export type UserInfo = {
  id: number;
  name: string;
  avatar?: {
    medium?: string;
  };
};

export type UserLists = Partial<Record<MediaListStatus, Media[]>>;

export type AnimeData = {
  media/* ? */: Media[];
  pageInfo?: PageInfo;
};

export type ListAnimeData = {
  id: number | null;
  mediaId: number | null;
  progress?: number | null;
  media: Media;
};

export type TrendingAnime = AnimeData;
export type MostPopularAnime = AnimeData;
export type OneShotAnime = AnimeData;
export type CurrentListAnime = ListAnimeData[];
