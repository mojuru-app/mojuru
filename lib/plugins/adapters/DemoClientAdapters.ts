import { MediaResult, PluginMetadata, PluginProvider } from '@/models/plugins';
import { StreamingSource } from '@/models/streamingSource';

import { PluginProviderAdapter } from './baseAdapter';

/**
 * most of the code is useless, and could be refactored. it's just a copy of AlternativeClient
 */
export class DemoAdapter implements PluginProviderAdapter {
  async getEpisodeCount(script: string, id: string): Promise<number> {
    const apiFactory = new Function(script);
    const api = apiFactory();

    const eps = JSON.parse(await api.extractEpisodes(id)) || [];
    return eps.length;
  }

  pluginProvider: PluginProvider = 'Demo';

  async loadPlugin(pluginUrl: string): Promise<PluginMetadata> {
    const pluginRes = await fetch(pluginUrl);
    if (!pluginRes.ok) {
      throw `Error fetching ${this.pluginProvider} plugin: ${pluginRes.status} ${pluginRes.statusText}`;
    }

    const plugin = await pluginRes.json();
    return plugin as PluginMetadata;
  }

  async getPluginScript(metadata: PluginMetadata): Promise<string> {
    const scriptUrl = metadata.scriptUrl;

    const scriptRes = await fetch(scriptUrl);
    if (!scriptRes.ok) {
      throw new Error(`Error fetching plugin script: ${scriptRes.status} ${scriptRes.statusText}`);
    }

    return await scriptRes.text();
  }

  searchInPlugin = async (script: string, query: string): Promise<MediaResult[] | null> => {
    try {
      const apiFactory = new Function(script);
      const api = apiFactory();

      const results = JSON.parse(await api.search(query));

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
    throw 'No matching available';
  };

  getEpisodeSource = async (
    script: string,
    metadata: PluginMetadata,
    id: string,
    episode: number
  ): Promise<StreamingSource[] | null> => {
    const apiFactory = new Function(script);
    const api = apiFactory();

    const episodes = JSON.parse(await api.fetchEpisodes(id));
    let episodeId: string | undefined = undefined;

    if (!episodes || episodes.length === 0) {
      return null;
    }

    episodeId = episodes.find((e: any) => e.number == episode).href;

    const url = (await api.fetchSources(episodeId)) as string;

    const sources = [
      {
        label: 'default',
        qualities: [
          {
            quality: 'default',
            url,
          },
        ],
      },
    ];

    return sources;
  };
}
