import { AlternativeAdapter } from '@/lib/plugins/adapters/AlternativeClientAdapter';
import { DemoAdapter } from '@/lib/plugins/adapters/DemoClientAdapters';
import { StandardClientAdapter } from '@/lib/plugins/adapters/StandardClientAdapter';
import { getParsedTitles } from '@/lib/plugins/utils';
import { MediaData } from '@/models/mediaData';
import { MediaResult, Plugin, PluginMetadata, PluginProvider } from '@/models/plugins';
import { StreamingSource } from '@/models/streamingSource';
import { isBlacklistedRepo, isFromHostname, isFromRepoPartial } from '@/modules/utils/repo';
import axios from 'axios';
import { useEffect, useMemo } from 'react';

import { useStore } from '../../hooks/useStore';

const TEMP_DEMO_PLUGINS_REPO_URL =
  'https://api.github.com/repos/mojuru-app/mojuru-demo-plugins/contents';
const TEMP_RAW_BASE_URL =
  'https://raw.githubusercontent.com/mojuru-app/mojuru-demo-plugins/refs/heads/main';

/**
 * manage, install, remove and use plugins
 *
 * @param pluginProvider
 * @returns
 */
export const usePluginManager = (pluginProvider?: PluginProvider | null) => {
  const { store, setStoreItem } = useStore();

  const getAdapter = (provider?: PluginProvider) => {
    switch (provider ?? pluginProvider) {
      case 'Demo':
        return new DemoAdapter();
      case 'Standard':
        return new StandardClientAdapter();
      case 'Alternative':
        return new AlternativeAdapter();
      default:
        throw new Error(`No adapter found for provider: ${pluginProvider}`);
    }
  };

  /**
   * get all the stored plugins metadata
   */
  const allPlugins: Plugin[] = useMemo(() => {
    return Object.values(store.plugins).flat() as Plugin[];
  }, [store.plugins]);

  /**
   * get all the stored plugins metadata of the provider
   *
   * returns allPlugins if no plugin provider is passed to the hook
   */
  const providerPlugins: Plugin[] = useMemo(() => {
    if (pluginProvider) {
      return store.plugins[pluginProvider] || [];
    }
    return allPlugins;
  }, [store.plugins, pluginProvider, allPlugins]);

  /**
   * get all the stored plugins (both metadata and scripts) of the provider
   *
   * returns all the plugins if no plugin provider is passed to the hook
   */
  const fullProviderPlugins: Plugin[] = useMemo(() => {
    if (pluginProvider) {
      return store.plugins[pluginProvider] || [];
    }
    return Object.values(store.plugins).flat();
  }, [store.plugins, pluginProvider]);

  /**
   * Returns all plugins that have a media field
   */
  const pluginsWithMedia = useMemo(() => {
    if (!store.plugins) return [];

    const allPlugins = Object.values(store.plugins).flat() as Plugin[];
    return allPlugins.filter((plugin) => plugin.metadata.media !== undefined);
  }, [store.plugins]);

  const getEpisodeCount = async (pluginName: string | null, id: string) => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    if (pluginName === null) throw new Error(`pluginName passed value is null`);

    const plugin = fullProviderPlugins.find((p: Plugin) => p.metadata.name === pluginName);
    if (!plugin) throw new Error(`${pluginName} plugin not found`);

    const adapter = getAdapter();
    const count = await adapter.getEpisodeCount(plugin.script, id);

    return count;
  };

  const loadPlugin = async (url: string, provider?: PluginProvider): Promise<PluginMetadata> => {
    const isAlternative = (url: string) =>
      isFromHostname(url, 'git.luna-app.eu') || isFromRepoPartial(url, '50n50');
    // isFromRepoPartial(url, 'Sora') ||
    // isFromRepoPartial(url, 'sora');
    // const isDemo = (url: string) => isFromRepo(url, 'mojuru-app', 'mojuru-demo-plugins');

    // throws error if can't validate plugin
    await isBlacklistedRepo(url);

    let p: PluginProvider = 'Standard';
    if (provider !== undefined) {
      p = provider;
    } else {
      // no passed provider so it will be detected automatically
      if (isAlternative(url)) p = 'Alternative';

      // if (isDemo(url)) p = 'Demo';
      // else if (isAlternative(url)) p = 'Alternative';
    }

    try {
      const adapter = getAdapter(p);
      const pluginMetadata = await adapter.loadPlugin(url);

      return pluginMetadata;
    } catch (err: any) {
      console.log(`Error loading plugin:`, err);
      throw 'Failed to load plugin.';
    }
  };

  /**
   * installs the passed plugin in the system
   * (if raw it's unusable, first fixes the script that's going to be stored)
   * additionaly, if it's the first plugin installed, it also actives it
   *
   * @param metadata
   */
  const installPlugin = async (metadata: PluginMetadata) => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    try {
      const adapter = getAdapter();
      const script = await adapter.getPluginScript(metadata);

      const plugin: Plugin = {
        metadata,
        script,
      };

      const updatedPlugins = [
        ...(store.plugins[pluginProvider] || []).filter(
          (p: Plugin) => p.metadata.name !== plugin.metadata.name
        ),
        plugin,
      ];

      await setStoreItem('plugins', {
        ...store.plugins,
        [pluginProvider]: updatedPlugins,
      });
    } catch (err: any) {
      console.error(`Error loading plugin:`, err);
      throw new Error(`Error loading plugin: ${err.message}`);
    }
  };

  const removePlugin = async (pluginName: string) => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    const updatedPlugins = (store.plugins[pluginProvider] || []).filter(
      (p: Plugin) => p.metadata.name !== pluginName
    );

    await setStoreItem('plugins', {
      ...store.plugins,
      [pluginProvider]: updatedPlugins,
    });

    // remove if was active
    if (store?.activePlugin?.metadata?.name === pluginName)
      await setStoreItem('activePlugin', null);
  };

  const clearPlugins = async () => {
    await setStoreItem('plugins', {});
    await setStoreItem('activePlugin', null);
  };

  const searchInPlugin = async (
    pluginName: string | null,
    query: string
  ): Promise<MediaResult[] | null> => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    if (pluginName === null)
      throw new Error(
        `pluginName passed value is null. Probably you passed a store.activePlugin as null?`
      );

    const plugin = fullProviderPlugins.find((p: Plugin) => p.metadata.name === pluginName);
    if (!plugin) throw new Error(`${pluginName} plugin not found`);

    const adapter = getAdapter();
    const results = await adapter.searchInPlugin(plugin.script, query);

    return results;
  };

  const searchMatchInPlugin = async (
    pluginName: string | null,
    media: MediaData
  ): Promise<MediaResult | null> => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    if (pluginName === null) throw new Error(`pluginName passed value is null`);

    const plugin = fullProviderPlugins.find((p: Plugin) => p.metadata.name === pluginName);
    if (!plugin) throw new Error(`${pluginName} plugin not found`);

    const parsedTitles = getParsedTitles(media);

    const adapter = getAdapter();
    const result = await adapter.searchMatchInPlugin(plugin.script, parsedTitles);

    return result;
  };

  /**
   *
   * @param id can be an id or a full url. depends on the plugin provider
   * @param episode
   * @returns
   */
  const getEpisodeSource = async (
    pluginName: string | null,
    id: string,
    episodeNumber: number
  ): Promise<StreamingSource[] | null> => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    if (pluginName === null) throw new Error(`pluginName passed value is null`);

    const plugin = fullProviderPlugins.find((p: Plugin) => p.metadata.name === pluginName);
    if (!plugin) throw new Error(`${pluginName} plugin not found`);

    const adapter = getAdapter();
    const enhancedSources = await adapter.getEpisodeSource(
      plugin.script,
      plugin.metadata,
      id,
      episodeNumber
    );

    return enhancedSources;
  };

  /**
   * Download and install all demo plugins
   */
  const installDemoPlugins = async (): Promise<PluginMetadata[]> => {
    if (!pluginProvider)
      throw new Error(`Method not callable. You must pass a valid plugin provider`);

    try {
      const response = await axios.get(TEMP_DEMO_PLUGINS_REPO_URL);
      const data = response.data;

      const folders = data.filter((item: any) => item.type === 'dir').map((item: any) => item.path);

      const pluginsToInstall: Plugin[] = [];

      for (const folder of folders) {
        try {
          const url = `${TEMP_RAW_BASE_URL}/${folder}/${folder}.json`;
          const metadata = await loadPlugin(url, 'Demo');
          const adapter = getAdapter('Demo');
          const script = await adapter.getPluginScript(metadata);

          pluginsToInstall.push({ metadata, script });
        } catch (err) {
          console.error(`Failed to fetch/install plugin ${folder}:`, err);
        }
      }

      const existingPlugins = store.plugins['Demo'] || [];
      const updatedPlugins = [
        ...existingPlugins.filter(
          (p: Plugin) => !pluginsToInstall.some((np) => np.metadata.name === p.metadata.name)
        ),
        ...pluginsToInstall,
      ];

      await setStoreItem('plugins', {
        ...store.plugins,
        ['Demo']: updatedPlugins,
      });

      return pluginsToInstall.map((p) => p.metadata);
    } catch (err: any) {
      console.error('Error installing demo plugins:', err);
      throw new Error(`Error installing demo plugins: ${err.message}`);
    }
  };

  return {
    allPlugins,
    providerPlugins,
    pluginsWithMedia,

    getEpisodeCount,
    loadPlugin,
    installPlugin,
    removePlugin,
    clearPlugins,
    installDemoPlugins,

    searchInPlugin,
    searchMatchInPlugin,
    getEpisodeSource,
  };
};
