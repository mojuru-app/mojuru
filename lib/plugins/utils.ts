import { MediaData } from "@/models/mediaData";



/**
 * Gets english, romaji and synonyms and combines them into an array
 *
 * @param {*} media
 * @returns titles
 */
export const getTitlesAndSynonyms = (media: MediaData): string[] => {
  var titles: string[] = [];

  if (!media.titles) return titles;

  if (media.titles.romaji) titles.push(media.titles.romaji);
  if (media.titles.english) titles.push(media.titles.english);

  return !media.synonyms
    ? titles
    : titles.concat(Object.values(media.synonyms));
};

/**
 * parses titles for episode url searching
 *
 * @param media
 * @returns parsed titles
 */
export const getParsedTitles = (media: MediaData): string[] => {
  let titles = getTitlesAndSynonyms(media);

  titles.forEach((title) => {
    if (title.includes("Season ")) titles.push(title.replace("Season ", ""));
    if (title.includes("Season ") && title.includes("Part "))
      titles.push(title.replace("Season ", "").replace("Part ", ""));
    if (title.includes("Part ")) titles.push(title.replace("Part ", ""));
    if (title.includes(":")) titles.push(title.replace(":", ""));
    if (title.includes("(") && title.includes(")"))
      // hunter x hunter
      titles.push(title.replace("(", "").replace(")", ""));
  });

  return titles;
};
