import { FRAME_MARGIN } from '@/constants/Utils';
import { MediaData, MediaProvider } from '@/models/mediaData';
import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { MediaSectionSkeleton } from '../Skeleton';
import Heading from '../ui/Heading';
import LazyFlatList from '../ui/LazyFlatList';
import MediaCard from './MediaCard';
import { Plugin } from '@/models/plugins';

const MediaSection: React.FC<{
  title: string;
  mediaList: MediaData[] | undefined | null;
  provider: MediaProvider;
  forcedPlugin?: Plugin;
  oneWideEntry?: boolean;
  lazy?: boolean;
}> = ({ title, mediaList, provider, forcedPlugin, oneWideEntry = false, lazy = true }) => {
  if (mediaList === null) return null;

  if (mediaList === undefined) return <MediaSectionSkeleton />;

  const ListComponent = lazy ? LazyFlatList : FlatList;

  return (
    <View style={{ gap: 10, marginBottom: 25 }}>
      <Heading text={title} style={{ paddingLeft: FRAME_MARGIN }} />

      <ListComponent
        data={mediaList}
        horizontal
        scrollEnabled={!oneWideEntry}
        showsHorizontalScrollIndicator={false}
        style={{ paddingLeft: FRAME_MARGIN }}
        renderItem={({ item, index }) => (
          <MediaCard
            key={index}
            media={item}
            provider={provider}
            forcedPlugin={forcedPlugin}
            isWide={oneWideEntry}
            style={{
              marginRight: index === mediaList.length - 1 ? FRAME_MARGIN * 2 : 8,
            }}
          />
        )}
      />
    </View>
  );
};

export default MediaSection;
