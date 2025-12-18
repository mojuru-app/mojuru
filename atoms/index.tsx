import { Colors, ThemeColor } from "@/constants/Colors";
import { UserInfo } from "@/models/anilist";
import { MediaData, UserMediaLists } from "@/models/mediaData";
import { atom } from "jotai";

/**
 * active media page context
*
* {
*  anilist:
*    110:
*      {...media}
*  x:
*    x:
*      {...media}
* }
*/
export const mediaAtom = atom<Record<string, Record<string, MediaData>>>({});

// anilist user stuff context
export const userInfoAtom = atom<UserInfo | null>(null);
export const userListsAtom = atom<UserMediaLists>();

// theme context
export const themeAtom = atom<ThemeColor>(Colors["Mojuru"]);
