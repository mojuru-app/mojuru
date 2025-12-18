import { themeAtom } from '@/atoms';
import { Colors } from '@/constants/Colors';
import { useAtom } from 'jotai';

/**
 * hook to manage the app's theme.
 *
 * @returns An object containing:
 *  - `theme`: The current theme object.
 *  - `changeTheme`: A function to update the theme.
 */

const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const changeTheme = async (newTheme: keyof typeof Colors) => {
    Colors[newTheme] ? setTheme(Colors[newTheme]) : setTheme(Colors['Mojuru']);
  };

  const resetTheme = () => {
    setTheme(Colors['Mojuru']);
  };

  return {
    theme,
    changeTheme,
    resetTheme,
  };
};

export default useTheme;
