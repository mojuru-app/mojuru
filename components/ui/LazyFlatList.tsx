import React, { useEffect, useState } from 'react';
import { FlatList, FlatListProps } from 'react-native';

interface LazyFlatListProps<T> extends FlatListProps<T> {
  slice?: number;
}

const LazyFlatList = <T,>({
  data = [],
  renderItem,
  slice = 5,
  onEndReachedThreshold = 0.2,
  ...props
}: LazyFlatListProps<T>) => {
  const [viewableData, setViewableData] = useState({
    list: (data as T[]).slice(0, slice),
    offset: slice,
  });

  useEffect(() => {
    setViewableData({
      list: (data as T[]).slice(0, slice),
      offset: slice,
    });
  }, [data, slice]);

  const renderMoreItems = () => {
    const { list, offset } = viewableData;
    if (!data || offset >= data.length) return;

    const nextItems = (data as T[]).slice(offset, offset + slice);
    setViewableData({
      list: list.concat(nextItems),
      offset: offset + slice,
    });
  };

  return (
    <FlatList
      data={viewableData.list}
      renderItem={renderItem}
      onEndReached={renderMoreItems}
      onEndReachedThreshold={onEndReachedThreshold}
      keyExtractor={(item, index) => index.toString()}
      {...props}
    />
  );
};

export default LazyFlatList;
