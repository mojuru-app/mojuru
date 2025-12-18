import {
  GRAPH_QL_URL,
  MEDIA,
  MEDIA_RECOMMENDATIONS,
  MEDIA_RELATIONS,
  METHOD,
  PAGES,
} from '@/constants/Anilist';
import {
  AnimeData,
  Media,
  MediaList,
  MediaListStatus,
  MostPopularAnime,
  OneShotAnime,
  RelationConnection,
  TrendingAnime,
  UserInfo,
  UserLists,
} from '@/models/anilist';

import { convertToUserList, getHeaders } from './anilistUtils';
import { getOptions, makeRequest } from './requests';
import { getRawStoreItem } from '../hooks/useStore';

export const getViewerId = async (accessToken?: string): Promise<number> => {
  var query = `
          query {
              Viewer {
                  id
              }
          }
      `;

  const options = getOptions(query);
  const respData = await makeRequest(METHOD, GRAPH_QL_URL, await getHeaders(accessToken), options);

  return respData.data.Viewer.id;
};

export const getUserInfo = async (viewerId: number | null): Promise<UserInfo | null> => {
  try {
    var query = `
    query($userId : Int) {
        User(id: $userId, sort: ID) {
            id
            name
            avatar {
                medium
            }
        }
    }
`;

    const respData = await makeRequest(
      METHOD,
      GRAPH_QL_URL,
      await getHeaders(),
      getOptions(query, {
        userId: viewerId,
      })
    );

    return respData.data.User;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTrendingAnime = async (): Promise<TrendingAnime | null> => {
  try {
    const query = `
     {
      Page(page: 1, perPage: ${PAGES}) {
       pageInfo {
         total
         currentPage
         hasNextPage
        }
       media(sort: TRENDING_DESC, type: ANIME) {
         ${MEDIA}
       }
      }
     }
    `;

    const respData = await makeRequest(METHOD, GRAPH_QL_URL, await getHeaders(), getOptions(query));

    return respData.data.Page;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTrendingAnimePosters = async (): Promise<string[]> => {
  try {
    const query = `
     {
      Page(page: 1, perPage: 100) {
       pageInfo {
         total
         currentPage
         hasNextPage
        }
       media(sort: TRENDING_DESC, type: ANIME) {
         coverImage { medium large extraLarge }
       }
      }
     }
    `;

    const respData = await makeRequest(METHOD, GRAPH_QL_URL, await getHeaders(), getOptions(query));

    const covers =
      (respData.data.Page.media as Media[])
        ?.map((m) => {
          const img = m.coverImage;
          return img?.medium ?? img?.large ?? img?.extraLarge;
        })
        .filter((x): x is string => Boolean(x)) ?? [];
    return covers
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getMostPopularAnime = async (): Promise<MostPopularAnime | null> => {
  try {
    const query = `
   {
    Page(page: 1, perPage: ${PAGES}) {
     pageInfo {
      total
      currentPage
      hasNextPage
     }
     media(sort: POPULARITY_DESC, type: ANIME) {
      ${MEDIA}
     }
    }
   }
  `;

    const respData = await makeRequest(METHOD, GRAPH_QL_URL, await getHeaders(), getOptions(query));

    return respData.data.Page;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getOneShotAnime = async (): Promise<OneShotAnime[] | null> => {
  try {
    const query = `
        {
          Page(page: 1, perPage: 100) {
            pageInfo {
              total
              currentPage
              hasNextPage
            }
            media(type: ANIME, episodes_greater: 10, episodes_lesser: 14, status: FINISHED, sort: POPULARITY_DESC) {
              ${MEDIA}
            }
          }
        }
      `;

    const respData = await makeRequest(METHOD, GRAPH_QL_URL, await getHeaders(), getOptions(query));

    const animeList = respData.data.Page.media;

    const filteredAnime = animeList.filter((anime: any) => {
      const hasRelated = anime.relations?.edges.some(
        (relation: any) => relation.relationType === 'SEQUEL' || relation.relationType === 'PREQUEL'
      );
      return !hasRelated;
    });

    return filteredAnime;
  } catch (error) {
    console.error('Error fetching one-shot anime:', error);
    return null;
  }
};

export const getAnimeRelations = async (animeId: number): Promise<RelationConnection | null> => {
  try {
    const query = `
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          ${MEDIA_RELATIONS}
        }
      }
    `;

    const variables = {
      id: animeId,
    };

    const respData = await makeRequest(
      METHOD,
      GRAPH_QL_URL,
      await getHeaders(),
      getOptions(query, variables)
    );

    return respData.data.Media.relations;
  } catch (error) {
    console.error('Error fetching anime relations:', error);
    return null;
  }
};

export const getAnimeRecommendations = async (animeId: number) => {
  try {
    const query = `
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          ${MEDIA_RECOMMENDATIONS}
        }
      }
    `;

    const variables = {
      id: animeId,
    };

    const respData = await makeRequest(
      METHOD,
      GRAPH_QL_URL,
      await getHeaders(),
      getOptions(query, variables)
    );

    return respData.data.Media.recommendations;
  } catch (error) {
    console.error('Error fetching anime recommendations:', error);
    return null;
  }
};

export const getUserLists = async (
  viewerId: number,
  ...statuses: MediaListStatus[]
): Promise<UserLists> => {
  try {
    var query = `
          query($userId : Int, $statuses: [MediaListStatus]) {
              MediaListCollection(userId : $userId, type: ANIME, status_in: $statuses, sort: UPDATED_TIME_DESC) {
                  lists {
                      isCustomList
                      name
                      status
                      entries {
                          id
                          mediaId
                          progress
                          media {
                              ${MEDIA}
                          }
                      }
                  }
              }
          }
      `;

    const respData = await makeRequest(
      METHOD,
      GRAPH_QL_URL,
      await getHeaders(),
      getOptions(query, {
        userId: viewerId,
        statuses: statuses,
      })
    );

    if (
      respData.data.MediaListCollection.lists.length === 0 ||
      respData.data.MediaListCollection.lists === undefined
    )
      return {} as UserLists;

    return convertToUserList(respData.data.MediaListCollection.lists);
  } catch (error) {
    console.log(error);
    return {} as UserLists;
  }
};

export const searchFilteredAnime = async (args: string, page: number = 1): Promise<AnimeData> => {
  var query = `
      {
          Page(page: ${page}, perPage: 50) {
              pageInfo {
                  total
                  currentPage
                  hasNextPage
              }
              media(${args}) {
                  ${MEDIA}
              }
          }
      }
      `;

  const respData = await makeRequest(METHOD, GRAPH_QL_URL, await getHeaders(), getOptions(query));
  return respData.data.Page;
};

/* MUTATIONS */

/**
 * Updates a media entry list
 *
 * @param mediaId
 * @param status
 * @param scoreRaw
 * @param progress
 * @returns media list entry id
 */
export const updateAnimeFromList = async (
  mediaId: any,
  status?: any,
  scoreRaw?: any,
  progress?: any
): Promise<MediaList | null> => {
  const accessToken = await getRawStoreItem('access_token');
  if (!accessToken) return null;

  try {
    var query = `
          mutation($mediaId: Int${progress ? ', $progress: Int' : ''}${
      scoreRaw ? ', $scoreRaw: Int' : ''
    }${status ? ', $status: MediaListStatus' : ''}) {
              SaveMediaListEntry(mediaId: $mediaId${progress ? ', progress: $progress' : ''}${
      scoreRaw ? ', scoreRaw: $scoreRaw' : ''
    }${status ? ', status: $status' : ''}) {
                  id
                  mediaId
                  status
                  score
                  progress
              }
          }
      `;

    var variables: any = {
      mediaId: mediaId,
    };

    if (status !== undefined) variables.status = status;
    if (scoreRaw !== undefined) variables.scoreRaw = scoreRaw;
    if (progress !== undefined) variables.progress = progress;

    const respData = await makeRequest(
      METHOD,
      GRAPH_QL_URL,
      {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      getOptions(query, variables)
    );

    return respData.data.SaveMediaListEntry as MediaList;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteAnimeFromList = async (id: any): Promise<boolean> => {
  const accessToken = await getRawStoreItem('access_token');
  if (!accessToken) return false;

  try {
    var query = `
          mutation($id: Int){
              DeleteMediaListEntry(id: $id){
                  deleted
              }
          }
      `;

    var headers = {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    var variables = {
      id: id,
    };

    const options = getOptions(query, variables);
    const respData = await makeRequest(METHOD, GRAPH_QL_URL, headers, options);

    return respData.data.DeleteMediaListEntry.deleted as boolean;
  } catch (error) {
    console.log(error);
    return false;
  }
};
