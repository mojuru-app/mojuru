export const timeToSeconds = (time: string): number => {
  const parts = time.split(':');

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2].replace(',', '.'));
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS.mmm
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1].replace(',', '.'));
    return minutes * 60 + seconds;
  } else {
    // unknown
    console.warn(`Format error: ${time}`);
    return 0;
  }
};

// in seconds
export const parseTime = (currentTime: number): string => {
  const hours = Math.floor(Math.trunc(currentTime) / 3600);
  const minutes = Math.floor((Math.trunc(currentTime) % 3600) / 60);
  const seconds = Math.trunc(currentTime) % 60;

  const hoursStr = hours > 0 ? `${hours}:` : '';
  const minutesStr = `${hours > 0 ? String(minutes).padStart(2, '0') : minutes}:`;
  const secondsStr = String(seconds).padStart(2, '0');

  return `${hoursStr}${minutesStr}${secondsStr}`;
};

// in seconds
export const formatRemainingTime = (duration: number, currentTime: number): string => {
  const remainingTime = Math.trunc(duration - currentTime);

  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;

  const hoursStr = hours > 0 ? `${hours}:` : '';
  const minutesStr = `${hours > 0 ? String(minutes).padStart(2, '0') : minutes}:`;
  const secondsStr = String(seconds).padStart(2, '0');

  return `${hoursStr}${minutesStr}${secondsStr}`;
};
