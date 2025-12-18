import Frame from '@/components/Frame';
import { PluginItem } from '@/components/plugins/PluginItem';
import { Button } from '@/components/ui/Buttons';
import Txt from '@/components/ui/Txt';
import { FRAME_MARGIN } from '@/constants/Utils';
import { useFullScreenLoader } from '@/hooks/FullScreenLoader';
import { useMedia } from '@/hooks/useMedia';
import useTheme from '@/hooks/useTheme';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { Plugin } from '@/models/plugins';
import { router } from 'expo-router';
import { Download, Frown } from 'lucide-react-native';
import { FlatList, TouchableOpacity, View } from 'react-native';

export default function DemoPluginsScreen() {
  const { ensureMedia } = useMedia();
  const { theme } = useTheme();
  const { allPlugins: plugins, installDemoPlugins } = usePluginManager('Demo');
  const { showLoader, updateLoader, hideLoader } = useFullScreenLoader();

  const mediaPlugins = plugins.filter((p) => p.metadata.pluginProvider === 'Demo');

  const handleInstallDemoPlugins = async () => {
    try {
      showLoader('Installing demo plugins...', theme.idle.toString());

      await installDemoPlugins();

      updateLoader('Done!', theme.success.toString());

      setTimeout(() => {
        hideLoader();
      }, 1000);
    } catch (error) {
      hideLoader();
      alert(error);
    }
  };

  const openPluginScreen = (plugin: Plugin) => {
    if (!plugin.metadata.media) {
      return;
    }

    ensureMedia('plugin', plugin.metadata.media);

    router.push({
      pathname: `/media-page/[id]`,
      params: {
        id: plugin.metadata.media.id,
        provider: 'plugin',
        forcedPlugin: JSON.stringify(plugin),
      },
    });
  };

  return (
    <Frame
      bigHeading="Demo Plugins"
      showCollapsibleHeader
      collapsibleHeaderText="Demo Plugins"
      backButton
    >
      <View style={{ marginHorizontal: FRAME_MARGIN, marginBottom: 30 }}>
        <FlatList
          data={mediaPlugins}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ gap: 10 }}
          scrollEnabled={false}
          ListHeaderComponent={
            <Button
              title={'Install Demo Plugins'}
              LeftIcon={Download}
              type="primary"
              onPress={handleInstallDemoPlugins}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignContent: 'center',
                marginVertical: '50%',
                gap: 10,
              }}
            >
              <Frown color={theme.textMuted} size={30} style={{ alignSelf: 'center' }} />
              <Txt
                style={{
                  width: '75%',
                  alignSelf: 'center',
                  textAlign: 'center',
                  fontFamily: 'Medium',
                  color: theme.textMuted,
                }}
              >
                {'No Demo plugins installed yet.'}
              </Txt>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity>
              <PluginItem
                plugin={item}
                selectedPlugin={''}
                onPress={() => {
                  openPluginScreen(item);
                }}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </Frame>
  );
}
