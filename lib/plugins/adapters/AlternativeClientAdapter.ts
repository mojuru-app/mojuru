import { MediaResult, PluginMetadata, PluginProvider } from '@/models/plugins';
import { QualityStream, StreamingSource, SubtitleTrack } from '@/models/streamingSource';
import { AsyncFunction } from '@/modules/utils/function';

import { PluginProviderAdapter } from './baseAdapter';

export class AlternativeAdapter implements PluginProviderAdapter {
  pluginProvider: PluginProvider = 'Alternative';

  async loadPlugin(pluginUrl: string): Promise<PluginMetadata> {
    const pluginRes = await fetch(pluginUrl);
    if (!pluginRes.ok) {
      throw `Error fetching ${this.pluginProvider} plugin: ${pluginRes.status} ${pluginRes.statusText}`;
    }

    const plugin = await pluginRes.json();
    return {
      name: plugin.sourceName,
      compatible: plugin.asyncJS == true,
      pluginType: 'provider',
      pluginProvider: this.pluginProvider,
      contentProvider: plugin.sourceName,
      scriptUrl: plugin.scriptUrl,
      iconUrl: plugin.iconUrl,
      author: plugin.author,
      version: plugin.version,
      language: plugin.language,
      streamType: plugin.streamType,
      quality: plugin.quality,
      baseUrl: plugin.baseUrl,
      type: plugin.type,
    };
  }

  async getPluginScript(metadata: PluginMetadata): Promise<string> {
    const scriptUrl = metadata.scriptUrl;

    const scriptRes = await fetch(scriptUrl, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
    if (!scriptRes.ok) {
      throw new Error(`Error fetching plugin script: ${scriptRes.status} ${scriptRes.statusText}`);
    }

    const initialScript = await scriptRes.text();

    const script =
      `async function fetchAndText(url, options) {
        const response = await fetch(url, options);
        return await response.text();
      }\n
      function fetchAlt(url, headers = {}, method = "GET", body = null, redirect = "follow") {
        const options = {
          method,
          headers,
          redirect
        };

        if (body && method !== "GET" && method !== "HEAD") {
          options.body = body;
        }

        return fetch(url, options);
      }\n` +
      initialScript
        // .replaceAll('fetchv2', 'xxxxxxxx')
        // .replaceAll('fetch', 'fetchAndText')
        // .replaceAll('xxxxxxxx', 'fetch')
        .replaceAll('fetchv2', 'fetchAlt')
        .replaceAll(/(^|[\s(;,{])async\s*\(\s*([^)]*?)\s*\)\s*=>/gm, '$1async function ($2)') +
      `\n\nreturn {
          searchResults,
          extractDetails,
          extractEpisodes,
          extractStreamUrl
        };`;

    return script;
  }

  searchInPlugin = async (script: string, query: string): Promise<MediaResult[] | null> => {
    try {
      const apiFactory = new AsyncFunction(script);
      const api = await apiFactory();

      const results = JSON.parse(await api.searchResults(query));

      return results.map((r: any) => ({
        id: r.href,
        title: r.title,
        image: r.image,
        url: r.href,
      })) as MediaResult[];
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  searchMatchInPlugin = async (
    script: string,
    parsedTitles: string[]
  ): Promise<MediaResult | null> => {
    const apiFactory = new AsyncFunction(script);
    const api = await apiFactory();

    try {
      for (const title of parsedTitles) {
        const results = JSON.parse(await api.searchResults(title));

        const animeResult =
          results.filter(
            (result: any) => result.title?.toLowerCase().trim() == title.toLowerCase().trim()
          )[0] ?? null;

        if (animeResult)
          return {
            id: animeResult.href,
            title: animeResult.title,
            image: animeResult.image,
            url: animeResult.href,
          };
      }
    } catch (error) {
      console.log(error);
      return null;
    }

    return null;
  };

  getEpisodeCount = async (script: string, id: string): Promise<number> => {
    const apiFactory = new AsyncFunction(script);
    const api = await apiFactory();

    let p = 1;
    let fetchedEps = [];
    let prevFetchedEps = [];
    let eps: any[] = [];

    try {
      do {
        prevFetchedEps = fetchedEps;
        fetchedEps = JSON.parse(await api.extractEpisodes(id, p)) || [];

        eps = eps.concat(fetchedEps);
        p++;
      } while (fetchedEps.slice(-1)[0]?.number !== prevFetchedEps.slice(-1)[0]?.number);
    } catch (error) {
      return 0;
    }

    return eps.slice(-1)[0]?.number;
  };

  parseToStreamingSources(parsed: any): StreamingSource[] {
    if (!parsed) return [];

    // case 1: multiple streams
    if (Array.isArray(parsed.streams)) {
      return parsed.streams.map((item: any): StreamingSource => {
        const qualities: QualityStream[] = [
          {
            quality: 'default',
            url: item.streamUrl,
            headers: item.headers || {},
          },
        ];

        let subtitles: SubtitleTrack[] | undefined;

        if (item.subtitles) {
          // subtitles inside each stream
          subtitles = [
            {
              url: item.subtitles,
              label: 'Subtitle',
              format: item.subtitles.endsWith('.vtt') ? 'vtt' : undefined,
            },
          ];
        } else if (parsed.subtitles) {
          // common subtitles in root
          subtitles = [
            {
              url: parsed.subtitles,
              label: 'Subtitle',
              format: parsed.subtitles.endsWith('.vtt') ? 'vtt' : undefined,
            },
          ];
        }

        return {
          label: item.title,
          qualities,
          subtitles,
        };
      });
    }

    // case 2: single stream + optional subtitle
    if (typeof parsed.stream === 'string') {
      const qualities: QualityStream[] = [
        {
          quality: 'default',
          url: parsed.stream,
        },
      ];

      const subtitles: SubtitleTrack[] =
        typeof parsed.subtitles === 'string'
          ? [
              {
                url: parsed.subtitles,
                label: 'Subtitle',
                format: parsed.subtitles.endsWith('.vtt') ? 'vtt' : undefined,
              },
            ]
          : [];

      return [
        {
          label: 'Default Stream',
          qualities,
          subtitles,
        },
      ];
    }

    return [];
  }

  // with this plugins provider, the id is an url
  getEpisodeSource = async (
    script: string,
    metadata: PluginMetadata,
    id: string,
    episode: number
  ): Promise<StreamingSource[] | null> => {
    const apiFactory = new AsyncFunction(script);
    const api = await apiFactory();

    const episodes = JSON.parse(await api.extractEpisodes(id));
    let episodeHref: string | undefined = undefined;

    if (!episodes || episodes.length === 0) {
      return null;
    }

    if (episode <= episodes.length) {
      // no pages
      episodeHref = episodes.find((e: any) => e.number == episode).href;
    } else {
      // with pages (supposed to have only 2 arguments)
      let rightPage = Math.ceil(episode / episodes.length);

      const rightEpisodes = JSON.parse(await api.extractEpisodes(id, rightPage));

      episodeHref = rightEpisodes.find((e: any) => e.number == episode).href;
    }

    if (!episodeHref) {
      return null;
    }
    const rawResult = (await api.extractStreamUrl(episodeHref)) as string;
    let parsed: any;

    try {
      parsed = JSON.parse(rawResult);
    } catch {
      parsed = typeof rawResult === 'string' ? { stream: rawResult } : null;
    }

    const sources: StreamingSource[] = this.parseToStreamingSources(parsed);

    return sources;
  };
}
