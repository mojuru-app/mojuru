export const MOCK_STREAMING_SOURCES: StreamingSource[] = [
  {
    label: '[English Sub] Provider X',
    type: 'hls',
    qualities: [
      {
        quality: '1080p',
        url: 'https://cdn.example.com/video/1080p.m3u8',
        headers: {
          Authorization: 'Bearer example-token',
        },
        metadata: {
          language: 'English',
          runtime: 1440, // 24 minutes
          size: 800_000_000, // 800MB
        },
      },
      {
        quality: '720p',
        url: 'https://cdn.example.com/video/720p.m3u8',
        metadata: {
          language: 'English',
          runtime: 1440,
        },
      },
    ],
    subtitles: [
      {
        url: 'https://cdn.example.com/subs/en.vtt',
        label: 'English (default)',
        language: 'English',
        format: 'vtt',
      },
      {
        url: 'https://cdn.example.com/subs/it.srt',
        label: 'Italiano',
        language: 'Italian',
        format: 'srt',
      },
    ],
  },
  {
    label: '[English Sub] Provider Y',
    type: 'mp4',
    qualities: [
      {
        quality: '720p',
        url: 'https://cdn.example.com/video720.mp4',
        metadata: {
          language: 'Japanese',
          runtime: 1380,
          size: 650_000_000,
        },
      },
    ],
  },
  {
    label: '[English Sub] Provider Z',
    type: 'dash',
    qualities: [
      {
        quality: 'default',
        url: 'https://cdn.example.com/video/stream.mpd',
        headers: {
          'X-Custom-Header': 'value',
        },
        metadata: {
          language: 'French',
          runtime: 1500,
        },
      },
    ],
    subtitles: [
      {
        url: 'https://cdn.example.com/subs/fr.vtt',
        label: 'Français',
        language: 'French',
        format: 'vtt',
      },
    ],
  },
];
