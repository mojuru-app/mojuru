import Frame from '@/components/Frame';
import AddPluginDialog from '@/components/plugins/AddPluginDialog';
import { PluginItem } from '@/components/plugins/PluginItem';
import Txt from '@/components/ui/Txt';
import { FRAME_MARGIN, PLUGINS_HELP_URL } from '@/constants/Utils';
import { usePluginManager } from '@/lib/plugins/usePluginManager';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { Plugin } from '@/models/plugins';
import { capitalizeFirst } from '@/modules/utils/utils';
import { openUrlWithConfirmation } from '@/modules/utils/link';
import { hapticVibrate } from '@/modules/utils/haptics';
import { Box, Frown, HelpCircle, PackageOpen, Paintbrush, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';

const TAB_OPTIONS = ['provider', 'media'] as const;
type Tab = (typeof TAB_OPTIONS)[number];

export default function PluginsScreen() {
  const { store, setStoreItem } = useStore();
  const { allPlugins: plugins, clearPlugins } = usePluginManager();
  const { theme } = useTheme();

  const [addPluginDialogVisible, setAddPluginDialogVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('provider');

  const filteredPlugins = plugins.filter((p) => p.metadata.pluginType === activeTab.toLowerCase());

  const handleSelect = async (selectedPlugin: Plugin) => {
    hapticVibrate();
    await setStoreItem('activePlugin', selectedPlugin);
  };

  const handleClearPlugins = () => {
    Alert.alert('Clear Plugins', 'Are you sure you want to remove all the plugins installed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearPlugins();
          } catch (err) {
            console.error('Failed to clear plugins. Please try again.');
          }
        },
      },
    ]);
  };

  const CONTAINER_MARGIN = FRAME_MARGIN;
  const CONTAINER_PADDING = 4;
  const TAB_GAP = 0;
  // const TAB_GAP = 8;
  const CONTAINER_WIDTH = store.deviceWidth - CONTAINER_MARGIN * 2;
  const TAB_WIDTH = (CONTAINER_WIDTH - TAB_GAP) / 2;

  const segmentTranslateX = useSharedValue(0);

  useEffect(() => {
    segmentTranslateX.value = withTiming(activeTab === 'provider' ? 0 : 1, {
      duration: 200,
      easing: Easing.out(Easing.exp),
    });
  }, [activeTab]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: segmentTranslateX.value * (TAB_WIDTH + TAB_GAP),
        },
      ],
    };
  });

  return (
    <>
      <AddPluginDialog
        visible={addPluginDialogVisible}
        onClose={() => setAddPluginDialogVisible(false)}
      />

      <Frame
        bigHeading="Plugins"
        showCollapsibleHeader
        collapsibleHeaderText="Plugins"
        isTab
        rightIcons={[
          ...(plugins.length > 0
            ? [{ icon: Paintbrush, accent: theme.alert, onPress: handleClearPlugins }]
            : []),
          {
            icon: HelpCircle,
            onPress: () => {
              openUrlWithConfirmation(PLUGINS_HELP_URL);
            },
          },
          {
            icon: Plus,
            onPress: () => {
              setAddPluginDialogVisible(true);
            },
          },
          {
            icon: Box,
            onPress: () => {
              router.push('/plugin/demo-plugins');
            },
          },
        ]}
      >
        {/* <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.foreground,
            borderRadius: 10,
            marginHorizontal: CONTAINER_MARGIN,
            marginBottom: 20,
            paddingVertical: CONTAINER_PADDING,

            position: 'relative',
            width: CONTAINER_WIDTH,
            justifyContent: 'space-between',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: TAB_WIDTH - CONTAINER_PADDING * 2,
                height: '100%',
                backgroundColor: theme.mist,
                borderRadius: 8,
                marginHorizontal: CONTAINER_PADDING,
                top: CONTAINER_PADDING,
                bottom: CONTAINER_PADDING,
              },
              animatedIndicatorStyle,
            ]}
          />

          {TAB_OPTIONS.map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.5}
              onPress={() => {
                setActiveTab(tab);
                hapticVibrate();
              }}
              style={{
                width: TAB_WIDTH,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                zIndex: 1,
              }}
            >
              <Txt
                style={{
                  color: activeTab === tab ? theme.text : theme.textMuted,
                  fontSize: 14,
                  fontFamily: 'Bold',
                }}
              >
                {capitalizeFirst(tab)}
              </Txt>
            </TouchableOpacity>
          ))}
        </View> */}
        <View style={{ marginHorizontal: FRAME_MARGIN, marginBottom: 30 }}>
          <FlatList
            data={filteredPlugins}
            keyExtractor={(item) => item.metadata.name}
            contentContainerStyle={{ gap: 10 }}
            scrollEnabled={false}
            ListHeaderComponent={
              filteredPlugins.length > 0 ? (
                <Txt
                  style={{
                    color: theme.textMuted,
                    fontSize: 13,
                    fontFamily: 'Medium',
                  }}
                >
                  {activeTab === 'provider'
                    ? 'Tap the plugin you want to activate.'
                    : 'Already active and ready to use.'}
                  {'\nLong press to open plugin details.'}
                </Txt>
              ) : null
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
                  {activeTab === 'provider'
                    ? 'No Provider plugins installed yet.'
                    : 'No Media plugins installed yet.'}
                  {'\nTap the + button above to add one.'}
                </Txt>
              </View>
            }
            renderItem={({ item }) => (
              <PluginItem
                plugin={item}
                selectedPlugin={store?.activePlugin?.metadata?.name ?? ''}
                onSelect={activeTab === 'provider' ? handleSelect : () => {}}
              />
            )}
          />
        </View>
      </Frame>
    </>
  );
}
