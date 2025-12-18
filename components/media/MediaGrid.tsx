import { FRAME_MARGIN } from '@/constants/Utils';
import { FlatList, View } from 'react-native';

import { MediaData, MediaProvider } from '@/models/mediaData';
import MediaCard from './MediaCard';
import LazyFlatList from '../ui/LazyFlatList';
import { useEffect, useMemo } from 'react';
import { Plugin } from '@/models/plugins';

const MediaGrid: React.FC<{
  mediaList: MediaData[];
  provider: MediaProvider;
  forcedPlugin?: Plugin;
  filter?: string;
  scrollable?: boolean;
  withHorizontalMargin?: boolean;
}> = ({
  mediaList,
  provider,
  forcedPlugin,
  filter = '',
  scrollable = true,
  withHorizontalMargin = true,
}) => {
  const filteredMediaList = useMemo(
    () => mediaList?.filter((media) => filter === '' || media.mediaListEntry?.status === filter),
    [mediaList]
  );

  return (
    <LazyFlatList
      key={filter}
      data={filteredMediaList}
      horizontal={false}
      scrollEnabled={scrollable}
      keyExtractor={(_, index) => index.toString()}
      numColumns={3}
      columnWrapperStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginHorizontal: withHorizontalMargin ? FRAME_MARGIN : 0,
      }}
      renderItem={({ item, index }: { item: MediaData; index: number }) => (
        <View
          style={{
            width: '30%',
            marginBottom: '5%',
            marginRight: (index + 1) % 3 === 0 ? 0 : '5%',
          }}
        >
          <MediaCard media={item} provider={provider} forcedPlugin={forcedPlugin} />
        </View>
      )}
    />
  );
};

export default MediaGrid;
