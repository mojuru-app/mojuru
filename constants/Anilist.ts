export const GENRES = [
  { value: "", label: "Any" },
  { value: "Action", label: "Action" },
  { value: "Adventure", label: "Adventure" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Ecchi", label: "Ecchi" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Horror", label: "Horror" },
  { value: "Mahou Shoujo", label: "Mahou Shoujo" },
  { value: "Mecha", label: "Mecha" },
  { value: "Music", label: "Music" },
  { value: "Mystery", label: "Mystery" },
  { value: "Psychological", label: "Psychological" },
  { value: "Romance", label: "Romance" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Slice of Life", label: "Slice of Life" },
  { value: "Sports", label: "Sports" },
  { value: "Supernatural", label: "Supernatural" },
  { value: "Thriller", label: "Thriller" },
];

export const SEASONS = [
  { value: "", label: "Any" },
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

export const FORMATS = [
  { value: "", label: "Any" },
  { value: "TV", label: "TV Show" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
];

export const SORTS = [
  { value: "", label: "Any" },
  { value: "START_DATE_DESC", label: "Release Date" },
  { value: "SCORE_DESC", label: "Score" },
  { value: "POPULARITY_DESC", label: "Popularity" },
  { value: "TRENDING_DESC", label: "Trending" },
];

export const MediaTypes = {
  Anime: "ANIME",
  Manga: "MANGA",
};

export const RelationTypes: Record<string, string> = {
  SOURCE: "Source",
  ALTERNATIVE: "Alternative",
  OTHER: "Other",
  PREQUEL: "Prequel",
  SEQUEL: "Sequel",
  CHARACTER: "Character",
  SIDE_STORY: "Side Story",
  PARENT: "Parent",
  ADAPTATION: "Adaptation",
  SPIN_OFF: "Spin-Off",
  COMPILATION: "Compilation",
  CONTAINS: "Contains",
};

export const PAGES: number = 30;
export const METHOD: string = "POST";
export const GRAPH_QL_URL: string = "https://graphql.anilist.co";

const MEDIA_DATA = `
        id
        idMal
        type
        title { romaji english native }
        format
        status
        description
        startDate { year month day }
        endDate { year month day }
        episodes
        duration
        coverImage { large extraLarge color }
        bannerImage
        genres
        synonyms
        meanScore
        popularity
        isAdult
        nextAiringEpisode { id timeUntilAiring episode airingAt }
        mediaListEntry { id mediaId status score(format:POINT_10) progress }
`;

const MEDIA_TAGS = `tags { name }`;

const MEDIA_AIRING_SCHEDULE = `
        airingSchedule {
          edges {
            node {
              episode
            }
          }
        }
`;

const MEDIA_STUDIOS = `
        studios {
          edges {
            isMain
            node { id name }
          }
        }
`;

const MEDIA_CHARACTERS = `
        characters(perPage: 25, sort: [ROLE, RELEVANCE]) {
          edges {
            role
            node {
              id
              name { full }
              image { medium }
            }
          }
        }
`;

// relations can't have MEDIA_STUDIOS, Media.tags (why???)
export const MEDIA_RELATIONS: string = `
        relations {
          edges {
            id
            relationType(version: 2)
            node {
              ${MEDIA_DATA}
              ${MEDIA_AIRING_SCHEDULE}
              ${MEDIA_CHARACTERS}
            }
          }
        }
`;

// recommendations can't have MEDIA_AIRING_SCHEDULE, MEDIA_RELATIONS, MEDIA_CHARACTERS, MEDIA_STUDIOS
export const MEDIA_RECOMMENDATIONS: string = `
        recommendations(sort:RATING_DESC) {
          nodes {
            id
            rating
            mediaRecommendation {
              ${MEDIA_DATA}
              ${MEDIA_TAGS}
            }
          }
        }
`;

export const MEDIA: string = `
        ${MEDIA_DATA}
        ${MEDIA_TAGS}
        ${MEDIA_AIRING_SCHEDULE}
        ${MEDIA_STUDIOS}
        ${MEDIA_CHARACTERS}
    `;
