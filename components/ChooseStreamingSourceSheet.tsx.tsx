import { BORDER_RADIUS, FRAME_MARGIN, MODAL_MARGIN } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { LucideIcon, MonitorCog, Subtitles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import ActionSheet, {
  ActionSheetRef,
  registerSheet,
  SheetManager,
} from 'react-native-actions-sheet';

import Heading from './ui/Heading';
import LabelTag from './ui/LabelTag';
import Txt from './ui/Txt';
import { StreamingSource } from '@/models/streamingSource';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const ChooseStreamingSourceSheet: React.FC<{
  payload: {
    sources: StreamingSource[];
    insidePlayer?: boolean;
  };
}> = ({ payload: { sources, insidePlayer = false } }) => {
  const { theme } = useTheme();
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const hideWithResult = async (item: StreamingSource) => {
    SheetManager.hide('choose-streaming-source-sheet', {
      payload: { source: item } as any,
    });
  };

  return (
    <View style={{ width: '100%' }}>
      <ActionSheet
        id="choose-streaming-source-sheet"
        ref={actionSheetRef}
        gestureEnabled
        containerStyle={{
          paddingHorizontal: insidePlayer ? MODAL_MARGIN * 2 : 0,
          backgroundColor: theme.background.toString(),
          paddingTop: 4,
        }}
        indicatorStyle={{
          backgroundColor: theme.textMuted,
          height: 3,
        }}
      >
        <View style={{ marginTop: 8, marginBottom: 24 }}>
          <View style={{ paddingHorizontal: FRAME_MARGIN, gap: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Heading text="Select source" />
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <FlatList
              data={sources}
              scrollEnabled={false}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{
                paddingHorizontal: FRAME_MARGIN,
                gap: 6,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.foreground,
                    borderRadius: BORDER_RADIUS,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                  onPress={() => hideWithResult(item)}
                >
                  <View
                    style={{
                      // display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      flexWrap: 'wrap',
                      marginBottom: 6,
                    }}
                  >
                    <Txt
                      style={{
                        fontFamily: 'Bold',
                        color: theme.textSupporting,
                        fontSize: 16,
                        flexShrink: 1,
                        flexGrow: 1,
                        flexBasis: 0,
                      }}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Txt>
                    {item.type && (
                      <LabelTag
                        text={item.type}
                        textColor={theme.textShy}
                        bgColor={theme.mist}
                        style={{
                          paddingVertical: 3,
                          paddingHorizontal: 5,
                        }}
                        textStyle={{
                          fontSize: 11,
                          fontFamily: 'Bold',
                          textTransform: 'uppercase',
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <IconLabelWithList
                      label="Qualities"
                      icon={MonitorCog}
                      values={item.qualities.map((q) => q.quality)}
                    />
                    {item.subtitles && (
                      <>
                        <IconLabelWithList
                          label="Subtitles"
                          icon={Subtitles}
                          values={item.subtitles.map((s) => s.language ?? s.label)}
                          hasSeparator
                        />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};

const IconLabelWithList: React.FC<{
  label: string;
  icon: LucideIcon;
  values: string[];
  hasSeparator?: boolean;
}> = ({ label, icon: Icon, values, hasSeparator }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        flexShrink: 1,
      }}
    >
      {hasSeparator && (
        <Txt
          style={{
            fontFamily: 'SemiBold',
            fontSize: 13,
            color: theme.textMuted,
            marginRight: 6,
          }}
        >
          |
        </Txt>
      )}

      <Icon size={13} color={theme.textMuted} style={{ marginRight: 3 }} strokeWidth={2.5} />

      <Txt
        style={{
          fontFamily: 'SemiBold',
          fontSize: 13,
          color: theme.textMuted,
          flexShrink: 1,
          flexWrap: 'wrap',
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {values.join(', ')}
      </Txt>
    </View>
  );
};

registerSheet('choose-streaming-source-sheet', ChooseStreamingSourceSheet);

export default ChooseStreamingSourceSheet;
