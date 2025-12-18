type FormatLabel = 'vtt' | 'srt' | string;
type QualityLabel = '1080p' | '720p' | '480p' | '360p' | 'default' | string;
type StreamingType = 'hls' | 'dash' | 'mp4';

export interface SubtitleTrack {
  url: string;
  label: string;
  language?: string; // explicit where possible e.g. Italian, English...
  format?: FormatLabel;
}

interface StreamMetadata {
  language?: string; // explicit where possible e.g. Italian, English...
  runtime?: number; // in seconds
  size?: number; // in bytes
}

export interface QualityStream {
  quality: QualityLabel;
  url: string;
  headers?: Record<string, string>;
  metadata?: StreamMetadata;
}

export interface StreamingSource {
  label: string;
  type?: StreamingType;
  qualities: QualityStream[];
  subtitles?: SubtitleTrack[];
}


