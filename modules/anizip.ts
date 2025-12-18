import { MediaEpisodeCover } from "@/models/mediaData";

export const parseTitle = (
  info: MediaEpisodeCover | undefined,
  number: number | string
): string => {
  return info?.title?.replaceAll("`", "'") ?? `Episode ${number}`;
};

export const parseInsidePlayerTitle = (
  info: MediaEpisodeCover | undefined,
  number: number | string
): any => {
  let title = info?.title?.replaceAll("`", "'");
  return title ? `Ep. ${number} - ${title}` : `Episode ${number}`
};

export const parseLength = (info: MediaEpisodeCover | undefined): string =>
  `${info?.length}m`;

export const parseSummary = (info: MediaEpisodeCover | undefined): string =>
  info?.summary ?? "No summary available";
