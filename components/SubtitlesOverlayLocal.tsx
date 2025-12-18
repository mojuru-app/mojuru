import { useStore } from '@/hooks/useStore';
import React from 'react';
import { View } from 'react-native';
import RenderHTML from 'react-native-render-html';

type SubtitlesOverlayLocalProps = {
  activeSubtitle: string | null;
  subtitlesBottom: number;
  subtitlesFontSize: number;
  subtitlesPaddingRem: number;
  subtitlesLineHeight: number;
};

const SubtitlesOverlayLocal: React.FC<SubtitlesOverlayLocalProps> = ({
  activeSubtitle,
  subtitlesBottom,
  subtitlesFontSize,
  subtitlesPaddingRem,
  subtitlesLineHeight,
}) => {
  const { store } = useStore();

  if (!activeSubtitle) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: subtitlesBottom,
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
          fontSize: subtitlesFontSize,
          fontWeight: store.subtitlesFontWeight,
          color: store.subtitlesTextColor,
          textAlign: store.subtitlesTextAlign,
          backgroundColor: store.subtitlesHasBackground
            ? store.subtitlesBackgroundColor
            : 'transparent',
          paddingVertical: store.subtitlesPaddingVertical * subtitlesPaddingRem,
          paddingHorizontal: store.subtitlesPaddingHorizontal * subtitlesPaddingRem,
          borderRadius: store.subtitlesBorderRadius,
          lineHeight: subtitlesLineHeight,
        }}
      />
    </View>
  );
};

export default SubtitlesOverlayLocal;
