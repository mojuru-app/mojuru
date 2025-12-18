import { useStore } from '@/hooks/useStore';
import React from 'react';
import { View } from 'react-native';
import RenderHTML from 'react-native-render-html';

const SubtitlesOverlay: React.FC<{
  activeSubtitle: string | null;
}> = ({ activeSubtitle }) => {
  const { store } = useStore();

  if (!activeSubtitle) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: store.subtitlesBottom,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 1,
      }}
      pointerEvents="none"
    >
      <RenderHTML
        contentWidth={store.deviceHeight * 0.7}
        source={{ html: activeSubtitle }}
        baseStyle={{
          fontSize: store.subtitlesFontSize,
          fontWeight: store.subtitlesFontWeight,
          color: store.subtitlesTextColor,
          textAlign: store.subtitlesTextAlign,
          backgroundColor: store.subtitlesHasBackground
            ? store.subtitlesBackgroundColor
            : 'transparent',
          paddingVertical: store.subtitlesPaddingVertical * store.subtitlesPaddingRem,
          paddingHorizontal: store.subtitlesPaddingHorizontal * store.subtitlesPaddingRem,
          borderRadius: store.subtitlesBorderRadius,
          lineHeight: store.subtitlesLineHeight,
        }}
      />
    </View>
  );
};

export default SubtitlesOverlay;
