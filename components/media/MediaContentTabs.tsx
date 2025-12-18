import { FRAME_MARGIN } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { MediaData, MediaProvider } from '@/models/mediaData';
import { hapticVibrate } from '@/modules/utils/haptics';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import Heading from '../ui/Heading';
import MediaDetails from './MediaDetails';
import MediaEpisodesList from './MediaEpisodesList';
import MediaRelations from './MediaRelations';
import { Plugin } from '@/models/plugins';

type Tab = 'episodes' | 'relations' | 'details';

const MediaContentTabs: React.FC<{
  media?: MediaData;
  provider: MediaProvider;
  forcedPlugin?: Plugin;
  onEpisodePress: (number: number) => void;
}> = ({ media, provider, forcedPlugin, onEpisodePress }) => {
  const [activeTab, setActiveTab] = useState<Tab>('episodes');

  const renderContent = () => {
    switch (activeTab) {
      case 'episodes':
        return <MediaEpisodesList media={media} provider={provider} forcedPlugin={forcedPlugin} onPress={onEpisodePress} />;
      case 'relations':
        return <MediaRelations media={media} provider={provider} />;
      case 'details':
        return <MediaDetails media={media} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          marginHorizontal: -FRAME_MARGIN,
          paddingHorizontal: FRAME_MARGIN,
        }}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 20,
        }}
      >
        <TabButton
          label="Episodes"
          tab="episodes"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabButton
          label="Relations"
          tab="relations"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <TabButton
          label="Details"
          tab="details"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </ScrollView>

      <View style={{ marginTop: 16 }}>{renderContent()}</View>
    </View>
  );
};

type TabButtonProps = {
  label: string;
  tab: Tab;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

const TabButton: React.FC<TabButtonProps> = ({ label, tab, activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const isActive = activeTab === tab;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => {
        setActiveTab(tab);
        hapticVibrate();
      }}
    >
      <Heading
        text={label}
        style={{
          color: isActive ? theme.text : theme.textMuted,
        }}
      />
    </TouchableOpacity>
  );
};

export default MediaContentTabs;
