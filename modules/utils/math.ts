export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
export const getRandomMultiplier = (min: number, max: number) => (min + max) / 2;
// export const getRandomMultiplier = (min: number, max: number) => Math.random() * (max - min) + min;
