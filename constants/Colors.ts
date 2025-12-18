import { ColorValue } from 'react-native';

export type AvailableThemes =
  | 'Mojuru'
  | 'Akuse'
  | 'Saikou'
  | 'Hollowdeep'
  | 'Morningcrust'
  | 'Amoled';

export interface ThemeColor {
  [key: string]: ColorValue;
}

export const Common = {
  text: '#f2f2f2',
  textSupporting: '#ffffffbf',
  textShy: '#ffffff8c',
  textMuted: '#ffffff59',
  transparent: '#00FFFF00',
};

export const ColorsDescriptions: Record<AvailableThemes, string> = {
  Mojuru: 'The classic.',
  Akuse: 'That distant cousin, charming and unforgettable.',
  Saikou: 'Perhaps defeated, but never forgotten.',
  Hollowdeep: 'Inspired by the depths of an ancient kingdom.',
  Morningcrust: 'Warm fresh bread with honey butter.',
  Amoled: 'Pure darkness with colors that ignite the night.',
};

export const Colors: Record<AvailableThemes, ThemeColor> = {
  Mojuru: {
    ...Common,
    primary: '#6ad478',
    support: '#d96b98',
    success: '#6ad478',
    alert: '#eb483d',
    idle: '#e5a04a',
    background: '#12151b',
    foreground: '#1c2028',
    mist: '#2a2f3a',
  },
  Akuse: {
    ...Common,
    primary: '#ff456d',
    support: '#ff456d',
    success: '#41C957',
    alert: '#ff5454',
    idle: '#e5a639',
    background: '#13151b',
    foreground: '#1f2129',
    mist: '#2c2e3a',
  },
  Saikou: {
    ...Common,
    primary: '#ff0080',
    support: '#ff66b2',
    success: '#00ff99',
    alert: '#ff3b30',
    idle: '#ffc300',
    background: '#121923',
    foreground: '#19212d',
    mist: '#242e3e',
  },
  Hollowdeep: {
    ...Common,
    primary: '#f8f8f8',
    support: '#e28faa',
    success: '#88c9a1',
    alert: '#dc6a63',
    idle: '#eac26f',
    background: '#14151c',
    foreground: '#21222e',
    mist: '#333445',
  },
  Morningcrust: {
    ...Common,
    primary: '#ffaf25',
    support: '#e28faa',
    success: '#88c9a1',
    alert: '#dc6a63',
    idle: '#eac26f',
    background: '#14151c',
    foreground: '#21222e',
    mist: '#333445',
  },
  Amoled: {
    ...Common,
    primary: '#6ad478',
    support: '#d88ab7',
    success: '#5ecf94',
    alert: '#e25b5b',
    idle: '#e2c76c',
    background: '#080808',
    foreground: '#131313',
    mist: '#1E1E1E',
  },
};
