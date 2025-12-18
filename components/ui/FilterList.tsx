import { FRAME_MARGIN } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { hapticVibrate } from '@/modules/utils/haptics';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export type Filter = {
  label: string;
  value: string;
};

export type FilterListProps = {
  filters: Filter[];
  onSelect?: (filter: Filter) => void;
};

const FilterList: React.FC<FilterListProps> = ({ filters, onSelect }) => {
  const { theme } = useTheme();

  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const handleSelect = (filter: Filter) => {
    hapticVibrate();
    setSelectedFilter(filter.value);
    if (onSelect) onSelect(filter);
  };

  const renderItem = ({ item, index }: { item: Filter; index: number }) => {
    const isSelected = item.value === selectedFilter;
    const isFirstElement = index === 0;
    const isLastElement = index === filters.length - 1;

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => handleSelect(item)}
        style={{
          marginLeft: isFirstElement ? FRAME_MARGIN : 8,
          marginRight: isLastElement ? FRAME_MARGIN : 0,
          marginBottom: 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 25,
          backgroundColor: isSelected ? theme.primary : theme.mist,
        }}
      >
        <Text
          style={{
            color: isSelected ? theme.background : theme.textShy,
            fontFamily: 'SemiBold',
          }}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <FlatList
        data={filters}
        horizontal
        keyExtractor={(item) => item.value}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default FilterList;
