import Frame from '@/components/Frame';
import MediaGrid from '@/components/media/MediaGrid';
import SearchBar from '@/components/ui/SearchBar';
import { FRAME_MARGIN } from '@/constants/Utils';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { MediaData } from '@/models/mediaData';
import { Plugin } from '@/models/plugins';
import { getMediaDataSource } from '@/modules/mediaInfoAdapters/mediaDataFactory';
import { router, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

export default function PluginIndexScreen() {
  const params = useLocalSearchParams();
  const plugin: Plugin = JSON.parse(params.plugin as string);

  const { searchInPlugin } = usePluginManager(plugin?.metadata.pluginProvider);
  const pluginDataSource = getMediaDataSource('plugin');

  const [results, setResults] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const searchBarRef = useRef<TextInput>(null);

  const handleSeeInfo = () => {
    router.push({
      pathname: '/plugin/[pluginId]/info',
      params: {
        pluginId: plugin.metadata.name,
        onlyInfo: JSON.stringify(true),
        pluginMetadata: JSON.stringify(plugin.metadata),
      },
    });
  };

  const handleDebouncedSearch = async (query: string) => {
    if (query === '') {
      searchBarRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const r = await searchInPlugin(plugin.metadata.name, query);

      if (r === null) {
        setLoading(false);
        return;
      }

      setResults(pluginDataSource.convertList(r));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Frame
      bigHeading={plugin.metadata.name}
      showCollapsibleHeader
      collapsibleHeaderText={plugin.metadata.name}
      scrollable={false}
      rightIcons={[
        {
          icon: Info,
          onPress: handleSeeInfo,
        },
      ]}
      backButton
    >
      <View style={{ marginHorizontal: FRAME_MARGIN }}>
        <SearchBar
          ref={searchBarRef}
          onChangeText={() => setLoading(true)}
          onDebounceChangeText={handleDebouncedSearch}
          placeholder="Search..."
        />
      </View>

      <View style={{ marginTop: 20 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <MediaGrid mediaList={results} provider={'plugin'} forcedPlugin={plugin} />
        )}
      </View>
    </Frame>
  );
}
