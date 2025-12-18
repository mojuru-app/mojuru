import { MediaData } from "@/models/mediaData";
import { useEffect, useState } from "react";

import { useStore } from "./useStore";
import useTheme from "./useTheme";

interface DynColors {
  primary: string;
  dark: string;
  darker: string;
}

/**
 * Returns the appropriate color(s) based on the user's preference
 * between theme colors and media cover colors.
 */
const useDynColors = (media: MediaData) => {
  const { theme } = useTheme();
  const { store } = useStore();

  const defaultThemeColors = {
    primary: theme.primary.toString(),
    dark: theme.foreground.toString(),
    darker: theme.background.toString(),
  };

  const [dynColors, setDynColors] = useState<DynColors>(defaultThemeColors);

  useEffect(() => {
    if (store.dynColors && media.color)
      setDynColors({
        primary: media.color,
        dark: media.darkColor!,
        darker: media.darkerColor!,
      });
    else setDynColors(defaultThemeColors);
  }, [media?.color, store.dynColors, store.theme]);

  return { dynColors };
};

export default useDynColors;
