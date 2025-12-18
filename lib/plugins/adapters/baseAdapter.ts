import { MediaResult, PluginMetadata, PluginProvider } from '@/models/plugins';
import { StreamingSource } from '@/models/streamingSource';

export interface PluginProviderAdapter {
  pluginProvider: PluginProvider;

  loadPlugin(pluginUrl: string): Promise<PluginMetadata>;
  getPluginScript(metadata: PluginMetadata): Promise<string>;

  // useful, since many times you get episode count only after a fetch
  getEpisodeCount(script: string, id: string): Promise<number>;

  searchInPlugin(script: string, query: string): Promise<MediaResult[] | null>;
  searchMatchInPlugin(script: string, parsedTitles: string[]): Promise<MediaResult | null>;
  getEpisodeSource(
    script: string,
    metadata: PluginMetadata,
    id: string,
    episode: number
  ): Promise<StreamingSource[] | null>;
}
