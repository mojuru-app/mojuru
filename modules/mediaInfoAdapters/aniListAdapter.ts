import { Options } from '@/components/ui/OptionsModal';
import { EPISODES_PER_PAGE } from '@/constants/Utils';
import { Media, MediaListStatus, UserLists } from '@/models/anilist';
import { AnimeDBInfo } from '@/models/anizip';
import { MediaData, MediaDataSource, MediaEpisodeCover, UserMediaLists } from '@/models/mediaData';
import { darkenColor } from '@/modules/utils/color';
import axios from 'axios';

import { getAnimeRelations } from '../anilist';
import { getAvailableEpisodes, getEpisodes, getTitle } from '../anilistUtils';

export const AniListAdapter: MediaDataSource = {
  provider: 'anilist',

  convert: (rawMedia: Media): MediaData => {
    return {
      id: rawMedia.id,
      idMal: rawMedia.idMal,
      provider: 'anilist',
      episodesCoversSearchKey: rawMedia.id,
      title: getTitle(rawMedia),
      titles: rawMedia.title,
      synonyms: rawMedia.synonyms,
      coverImage: rawMedia.coverImage,
      bannerImage: {
        extraLarge: rawMedia.bannerImage,
      },
      color: rawMedia.coverImage?.color,
      darkColor: darkenColor(rawMedia.coverImage?.color, 12),
      darkerColor: darkenColor(rawMedia.coverImage?.color),
      startDate: rawMedia.startDate,
      endDate: rawMedia.endDate,
      genres: rawMedia.genres,
      description: rawMedia.description,
      status: rawMedia.status,
      format: rawMedia.format,
      rating: rawMedia.meanScore,
      tags: rawMedia.tags?.map((t) => t.name),
      duration: rawMedia.duration,
      episodes: getEpisodes(rawMedia),
      availableEpisodes: getAvailableEpisodes(rawMedia),
      mediaListEntry: rawMedia.mediaListEntry,
      recommendations: AniListAdapter.convertList(
        rawMedia?.recommendations?.nodes
          ?.flatMap((n) => n.mediaRecommendation)
          .filter((media) => media?.type === 'ANIME') || []
      ),
      relations: (() => {
        const animeEdges =
          rawMedia?.relations?.edges?.filter((e) => e?.node?.type === 'ANIME') || [];

        return AniListAdapter.convertList(animeEdges.map((e) => e.node)).map((media, i) => ({
          ...media,
          relationType: animeEdges[i].relationType,
        }));
      })(),
      studios: rawMedia?.studios?.edges?.flatMap((e) => e.node.name),
      characters: rawMedia?.characters?.edges?.flatMap((e) => ({
        name: e.node?.name?.full,
        role: e.role,
        image: e.node?.image?.medium,
      })),
    };
  },

  convertList: (rawMediaList: Media[]): MediaData[] =>
    rawMediaList.map((r) => AniListAdapter.convert(r)),

  convertUserLists: (rawUserMediaLists: UserLists): UserMediaLists => {
    try {
      const convertedLists: UserMediaLists = {};

      for (const status in rawUserMediaLists) {
        const list = AniListAdapter.convertList(rawUserMediaLists[status as MediaListStatus] || []);

        convertedLists[status as MediaListStatus] = list;
      }

      return convertedLists;
    } catch (error) {
      console.log(error);
      return {};
    }
  },

  hasNewEpisode: (rawMedia: Media): boolean =>
    !!(rawMedia.mediaListEntry
      ? rawMedia.status === 'RELEASING' &&
        (rawMedia.mediaListEntry?.progress ?? 0) < (getAvailableEpisodes(rawMedia) ?? -1)
      : rawMedia.status === 'RELEASING'),

  fetchEpisodesCovers: async (
    id: string | number
  ): Promise<Record<string, Record<string, MediaEpisodeCover>> | null> => {
    try {
      const { data } = await axios.get<AnimeDBInfo>(
        `https://api.ani.zip/mappings?anilist_id=${id}`
      );
      if (!data?.episodes) return null;

      const covers: Record<string, Record<string, MediaEpisodeCover>> = {
        1: {},
      };

      for (const [key, value] of Object.entries(data.episodes)) {
        covers[1][key] = {
          image: value.image,
          title: value?.title?.en,
          summary: value.summary,
          airdate: value.airdate,
          length: value.length,
          episodeNumber: value.episodeNumber,
        };
      }

      return covers;
    } catch {
      return null;
    }
  },

  needToFetchRelations: true,

  fetchRelations: async (media: MediaData) => {
    const rawRelations = await getAnimeRelations(Number(media.id));

    const edges = rawRelations?.edges?.filter((e) => e?.node?.type === 'ANIME') || [];

    const relations = AniListAdapter.convertList(edges.map((e) => e.node)).map((media, i) => ({
      ...media,
      relationType: edges[i].relationType,
    }));

    return relations.length > 0 ? relations : undefined;
  },

  getMediaEpisodesAndOptions: (media: MediaData, episodeCount: number) => {
    const episodes = Array.from({ length: episodeCount }, (_, index) => ({
      number: index + 1,
      episodeCover: media?.episodesCovers?.[1]?.[index + 1],
    }));

    const totalPages: number = Math.ceil(episodeCount / EPISODES_PER_PAGE);

    const options: Options = Array.from({ length: totalPages }, (_, index) => {
      const start = index * EPISODES_PER_PAGE + 1;
      const end = Math.min((index + 1) * EPISODES_PER_PAGE, episodeCount);
      return {
        label: `${start} - ${end}`,
        value: index + 1,
      };
    });

    return { episodes, options };
  },
};
