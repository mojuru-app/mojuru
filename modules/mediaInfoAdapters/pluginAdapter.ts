import { Options } from '@/components/ui/OptionsModal';
import { EPISODES_PER_PAGE } from '@/constants/Utils';
import { AnimeDBInfo } from '@/models/anizip';
import { MediaData, MediaDataSource, MediaEpisodeCover, UserMediaLists } from '@/models/mediaData';
import { MediaResult } from '@/models/plugins';
import axios from 'axios';

export const PluginAdapter: MediaDataSource = {
  provider: 'plugin',

  convert: function (rawMedia: MediaResult): MediaData {
    return {
      id: rawMedia.id,
      provider: 'plugin',
      episodesCoversSearchKey: rawMedia.title,
      title: rawMedia.title,
      coverImage: {
        extraLarge: rawMedia.image,
        large: rawMedia.image,
        medium: rawMedia.image,
      },
    };
  },

  convertList: (rawMediaList: MediaResult[]): MediaData[] =>
    rawMediaList.map((r) => PluginAdapter.convert(r)),

  convertUserLists: function (rawUserMediaLists: any): UserMediaLists {
    throw new Error('Function not implemented.');
  },

  hasNewEpisode: function (rawMedia: any): boolean {
    return false;
  },

  fetchEpisodesCovers: async (
    title?: string | number
  ): Promise<Record<string, Record<string, MediaEpisodeCover>> | null> => {
    if (title === undefined) return null;

    try {
      const anilistResponse = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Media(search: $search, type: ANIME) {
                id
              }
            }
          `,
          variables: {
            search: title,
          },
        }),
      });

      const anilistData = await anilistResponse.json();
      const id = anilistData.data?.Media?.id;

      if (!id) return null;

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

  needToFetchRelations: false,

  fetchRelations: function (media: MediaData): Promise<MediaData[] | undefined> {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  },

  getMediaEpisodesAndOptions: function (media: MediaData, episodeCount: number): { episodes: any[]; options: Options } {
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
