import { FuzzyDate } from '@/models/anilist';

export function parseFuzzyDate(date?: FuzzyDate): string {
  if (!date?.year) return '?';

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const day = date.day ? `${date.day}` : '';
  const month = date.month ? months[date.month - 1] : '';
  const year = date.year ? `${date.year}` : '';

  return day && month && year ? `${day} ${month} ${year}` : `${month} ${year}`;
}

export const formatStatus = (status: string | undefined): string => {
  switch (status) {
    case 'FINISHED':
      return 'Finished';
    case 'RELEASING':
      return 'Releasing';
    case 'NOT_YET_RELEASED':
      return 'Not Yet Released';
    case 'CANCELLED':
      return 'Cancelled';
    case 'HIATUS':
      return 'Hiatus';
    default:
      return '?';
  }
};

export const formatFormat = (format: string | undefined): string => {
  switch (format) {
    case 'TV':
      return 'TV Series';
    case 'TV_SHORT':
      return 'TV Short';
    case 'MOVIE':
      return 'Movie';
    case 'SPECIAL':
      return 'Special';
    case 'OVA':
      return 'OVA';
    case 'ONA':
      return 'ONA';
    case 'MUSIC':
      return 'Music';
    case 'MANGA':
      return 'Manga';
    case 'NOVEL':
      return 'Light Novel';
    case 'ONE_SHOT':
      return 'One Shot';
    default:
      return '?';
  }
};

export const formatYear = (year: number | undefined) => {
  return year?.toString() ?? '?';
};

export const formatDuration = (duration: number | undefined) => {
  return `${duration ?? '?c'} Minutes`;
};

export const formatEpisodes = (
  episodes: number | undefined,
  availableEpisodes: number | undefined
): string => {
  if (episodes === undefined && availableEpisodes === undefined) {
    return '? Episodes';
  }

  if (episodes !== undefined && availableEpisodes !== undefined && episodes === availableEpisodes) {
    const label = episodes === 1 ? 'Episode' : 'Episodes';
    return `${episodes} ${label}`;
  }

  const available = availableEpisodes ?? '?';
  const total = episodes ?? '?';
  const label = total === 1 || available === 1 ? 'Episode' : 'Episodes';

  return `${available}/${total} ${label}`;
};

export const formatGenres = (genres: string[] | undefined) => {
  return genres && genres.length > 0
    ? genres.length === 1
      ? genres[0]
      : `${genres[0]}/${genres[1]}`
    : '?';
};

export const formatRating = (rating: number | undefined): string => {
  if (rating === undefined) return '?';

  const scaled = (rating / 10).toFixed(1);
  return scaled;
};

export const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
