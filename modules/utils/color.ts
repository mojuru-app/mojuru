import { ColorValue } from 'react-native';

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  hex = hex.replace('#', '');

  if (hex.length !== 6) {
    console.error('Formato HEX non valido');
    return null;
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  hex = hex.replace('#', '');

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const hueToRGB = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRGB(p, q, h / 360 + 1 / 3) * 255);
  const g = Math.round(hueToRGB(p, q, h / 360) * 255);
  const b = Math.round(hueToRGB(p, q, h / 360 - 1 / 3) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`;
};

export const getContrastYIQ = (hex: string | undefined): ColorValue | undefined => {
  if (!hex) return undefined;

  const rgb = hexToRgb(hex);
  if (!rgb) return 'black';

  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  return (yiq >= 128 ? '#000000' : '#ffffff') as ColorValue;
};

export const darkenColor = (
  hex: string | undefined,
  targetLightness: number = 7,
  saturationBoost: number = 0
): string | undefined => {
  if (!hex) return undefined;

  let { h, s } = hexToHSL(hex);
  s = Math.min(s + saturationBoost - 40, 100);

  return hslToHex(h, s, targetLightness);
};
