import {
  getAnimeRecommendations,
  getMostPopularAnime,
  getTrendingAnime,
  getTrendingAnimePosters,
  getUserLists,
} from '@/modules/anilist';
import { MediaData } from './mediaData';
import { getMediaDataSource } from '@/modules/mediaInfoAdapters/mediaDataFactory';

const anilistDataSource = getMediaDataSource('anilist');

export const fetchUserLists = async (viewerId: number) => {
  try {
    const anilistLists = await getUserLists(
      viewerId,
      'CURRENT',
      'REPEATING',
      'PLANNING',
      'COMPLETED'
    );

    const lists = anilistDataSource.convertUserLists(anilistLists);
    // setUserLists(lists);
    return lists;
  } catch (error) {
    alert('Error fetching lists');
    return null;
  }
};

export const fetchTrending = async (): Promise<MediaData[] | null> => {
  try {
    const anilistTrending = await getTrendingAnime();
    if (anilistTrending === null) {
      return null;
    }

    const trending = anilistDataSource.convertList(anilistTrending.media);
    return trending;
  } catch (error) {
    alert('Error fetching trending');
    return null;
  }
};

export const fetchRandomTrendingPosters = async (): Promise<string[][]> => {
  try {
    const posters = await getTrendingAnimePosters();

    // shuffle
    for (let i = posters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posters[i], posters[j]] = [posters[j], posters[i]];
    }

    // clone 20 times
    const clonedPosters = Array(20).fill(posters).flat();

    // transform in cube matrix
    const N = clonedPosters.length;
    const rows = Math.floor(Math.sqrt(N));
    const cols = Math.ceil(N / rows);

    const posterMatrix: string[][] = [];
    for (let i = 0; i < rows; i++) {
      posterMatrix.push(clonedPosters.slice(i * cols, (i + 1) * cols));
    }

    const remaining = clonedPosters.slice(rows * cols);
    if (remaining.length > 0) {
      posterMatrix.push(remaining);
    }

    return posterMatrix;
  } catch (error) {
    alert('Error fetching random trending posters');
    return [];
  }
};


export const fetchPopular = async (): Promise<MediaData[] | null> => {
  try {
    const anilistPopular = await getMostPopularAnime();
    if (anilistPopular === null) {
      return null;
    }

    const popular = anilistDataSource.convertList(anilistPopular.media || []);
    return popular;
  } catch (error) {
    alert('Error fetching trending');
    return null;
  }
};

export const retrieveSpotlight = (trending: MediaData[] | null): MediaData | null => {
  // const spotlight = trending ? trending.find((m) => m.id === 154587) : null;
  const spotlight = trending
    ? trending.filter((media) => !media.mediaListEntry)[Math.floor(Math.random() * 10)]
    : null;

  return spotlight;
};

export const fetchBecauseYouLiked = async (mediaCompleted: MediaData[] | null) => {
  const randomCompleted = mediaCompleted
    ? mediaCompleted[Math.floor(Math.random() * mediaCompleted.length)]
    : null;

  if (randomCompleted === null) return null;

  const recommendations = await getAnimeRecommendations(Number(randomCompleted.id));

  const becauseYouLiked =
    anilistDataSource.convertList(
      recommendations?.nodes
        ?.flatMap((n: any) => n.mediaRecommendation)
        ?.filter((m: any) => m.mediaListEntry !== undefined)
        .filter((m: any) => m?.type === 'ANIME') || []
    ) ?? null;

  return becauseYouLiked === null
    ? null
    : {
        BYLTitle: randomCompleted.title,
        BYLList: becauseYouLiked,
      };
};
