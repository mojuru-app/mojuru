import { useMedia } from '@/hooks/useMedia';
import { MediaData, MediaProvider } from '@/models/mediaData';
import { getMediaDataSource } from '@/modules/mediaInfoAdapters/mediaDataFactory';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import MediaGrid from './MediaGrid';

const MediaRelations: React.FC<{
  media?: MediaData;
  provider: MediaProvider;
}> = ({ media, provider }) => {
  const { updateMedia } = useMedia();

  const [canRenderGrid, setCanRenderGrid] = useState<boolean>(false);

  const mediaDataSource = getMediaDataSource(provider);

  useEffect(() => {
    const refetchRelationsIfNeeded = async () => {
      if (!media) return;
      if (!mediaDataSource.needToFetchRelations) return; // no need to refetch with this media data source
      if (media.relations === undefined) return; // relations already been refetched
      if (media.relations?.length > 0) return; // media has already its relations

      const relations = await mediaDataSource.fetchRelations(media);

      updateMedia(provider, media.id, { relations });
    };

    refetchRelationsIfNeeded().then(() => {
      setCanRenderGrid(true);
    });
  }, []);

  return canRenderGrid ? (
    <MediaGrid
      mediaList={media?.relations || []}
      provider={provider}
      scrollable={false}
      withHorizontalMargin={false}
    />
  ) : (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
};

export default MediaRelations;
