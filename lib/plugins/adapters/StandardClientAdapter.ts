import { MediaResult, PluginMetadata, PluginProvider } from '@/models/plugins';
import { StreamingSource } from '@/models/streamingSource';

import { PluginProviderAdapter } from './baseAdapter';

// big ahh copy paste

export class StandardClientAdapter implements PluginProviderAdapter {
  getEpisodeCount = async (script: string, id: string): Promise<number> => {
    const apiFactory = new Function(script);
    const api = apiFactory();

    let p = 1;
    let fetchedEps = [];
    let prevFetchedEps = [];
    let eps: any[] = [];

    try {
      do {
        prevFetchedEps = fetchedEps;
        fetchedEps = JSON.parse(await api.fetchEpisodes(id, p)) || [];

        eps = eps.concat(fetchedEps);
        p++;
      } while (fetchedEps.slice(-1)[0]?.number !== prevFetchedEps.slice(-1)[0]?.number);
    } catch (error) {
      return 0;
    }

    return eps.slice(-1)[0]?.number;
  };

  pluginProvider: PluginProvider = 'Standard';

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

  async searchInPlugin(script: string, query: string): Promise<MediaResult[] | null> {
    try {
      const apiFactory = new Function(script);
      const api = apiFactory();

      const results = JSON.parse(await api.search(query));

      return results.map((r: any) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        url: r.url,
      })) as MediaResult[];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async searchMatchInPlugin(script: string, parsedTitles: string[]): Promise<MediaResult | null> {
    const apiFactory = new Function(script);
    const api = apiFactory();

    try {
      for (const title of parsedTitles) {
        const results = JSON.parse(await api.search(title));

        const animeResult =
          results.filter(
            (result: any) => result.title.toLowerCase().trim() == title.toLowerCase().trim()
          )[0] ?? null;

        if (animeResult)
          return {
            id: animeResult.id,
            title: animeResult.title,
            image: animeResult.image,
            url: animeResult.url,
          };
      }
    } catch (error) {
      console.log(error);
      return null;
    }

    return null;
  }

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

    if (episode <= episodes.length) {
      // no pages
      episodeId = episodes.find((e: any) => e.number == episode).id;
    } else {
      // with pages (supposed to have only 2 arguments)
      let rightPage = Math.ceil(episode / episodes.length);

      const rightEpisodes = JSON.parse(await api.fetchEpisodes(id, rightPage));

      episodeId = rightEpisodes.find((e: any) => e.number == episode).id;
    }

    if (!episodeId) {
      return null;
    }

    const rawResult = (await api.fetchSources(episodeId)) as string;

    let parsed;
    try {
      parsed = JSON.parse(rawResult);
    } catch {
      parsed = null;
    }

    return parsed;
  };
}
