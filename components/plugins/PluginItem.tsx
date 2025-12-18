import Txt from '@/components/ui/Txt';
import { BORDER_RADIUS } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { Plugin } from '@/models/plugins';
import { router } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import { PluginItemInfo } from './PluginItemInfo';
import { useMedia } from '@/hooks/useMedia';

export const PluginItem: React.FC<{
  plugin: Plugin;
  selectedPlugin: string;
  onPress?: (plugin: Plugin) => void;
  onSelect?: (plugin: Plugin) => void;
}> = ({ plugin, selectedPlugin, onPress, onSelect }) => {
  const { ensureMedia } = useMedia();
  const { theme } = useTheme();

  const selectable = plugin.metadata.media === undefined;
  const isSelected = plugin.metadata.name === selectedPlugin;

  const handleLeftPress = () => {
    selectable ? onSelect?.(plugin) : onPress?.(plugin)
  };

  const handleLongPress = () => {
    router.push({
      pathname: '/plugin/[pluginId]/info',
      params: {
        pluginId: plugin.metadata.name,
        onlyInfo: JSON.stringify(true),
        pluginMetadata: JSON.stringify(plugin.metadata),
      },
    });
  };

  const handleRightPress = () => {
    if (plugin.metadata.media) {
      ensureMedia('plugin', plugin.metadata.media);

      router.push({
        pathname: `/media-page/[id]`,
        params: {
          id: plugin.metadata.media.id,
          provider: 'plugin',
          forcedPlugin: JSON.stringify(plugin),
        },
      });
    } else {
      router.push({
        pathname: '/plugin/[pluginId]',
        params: {
          pluginId: plugin.metadata.name,
          plugin: JSON.stringify(plugin),
        },
      });
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        borderRadius: BORDER_RADIUS * 2,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={handleLeftPress}
        onLongPress={handleLongPress}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 20,
          backgroundColor: theme.foreground,
        }}
      >
        <Image
          source={{ uri: plugin.metadata.iconUrl }}
          style={{
            width: 60,
            height: 60,
            borderRadius: BORDER_RADIUS,
            backgroundColor: theme.mist,
          }}
          resizeMode="cover"
        />

        <View
          style={{
            flexDirection: 'column',
            gap: 3,
            flex: 1,
          }}
        >
          <Txt
            style={{
              color: theme.text,
              fontFamily: 'Bold',
              fontSize: 15,
            }}
          >
            {plugin.metadata.name}{' '}
            <Txt
              style={{
                color: theme.textMuted,
                fontFamily: 'SemiBold',
                fontSize: 14,
              }}
            >
              v{plugin.metadata.version}
            </Txt>
          </Txt>

          <PluginItemInfo label="Language" value={plugin.metadata.language} />
          <PluginItemInfo label="Quality" value={plugin.metadata.quality} />
        </View>

        {selectable && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 25,
              width: 25,
              borderRadius: BORDER_RADIUS * 2,
              borderWidth: 2,
              borderColor: isSelected ? theme.primary : theme.foreground,
              backgroundColor: isSelected ? theme.primary : theme.mist,
            }}
          >
            <Check color={isSelected ? theme.background : theme.mist} strokeWidth={3} size={20} />
          </View>
        )}
      </TouchableOpacity>

      {/* <TouchableOpacity
        activeOpacity={0.5}
        onPress={handleRightPress}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 50,
          borderLeftColor: theme.mist,
          borderLeftWidth: 2,
          backgroundColor: theme.foreground,
        }}
      >
        <ChevronRight color={theme.textMuted} />
      </TouchableOpacity> */}
    </View>
  );
};
