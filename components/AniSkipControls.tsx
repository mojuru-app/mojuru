import { FRAME_MARGIN } from '@/constants/Utils';
import { useAniSkip } from '@/hooks/useAniSkip';
import { useStore } from '@/hooks/useStore';
import { ChevronsRight, SkipForward } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { PlayerSkipButton } from './ui/Buttons';

interface AniSkipControlsProps {
  malId?: number;
  episodeNumber?: number;
  currentTime: number;
  onSkip: (toTime: number) => void;
  onNextEpisode: () => void;
  showDefault: boolean;
}

export const AniSkipControls: React.FC<AniSkipControlsProps> = ({
  malId,
  episodeNumber,
  currentTime,
  onSkip,
  onNextEpisode,
  showDefault,
}) => {
  const { segments, loading } = useAniSkip(malId, episodeNumber);
  const { store } = useStore();
  const [showAniSkipButtons, setShowAniSkipButtons] = useState(false);

  const activeSegments = segments.filter((seg) => currentTime >= seg.interval[0] && currentTime <= seg.interval[1]);
  const hasSkipEnding = activeSegments.some((seg) => seg.skipType === 'ed');

  useEffect(() => {
    if (activeSegments.length > 0) {
      setShowAniSkipButtons(true);

      const timeout = setTimeout(() => {
        setShowAniSkipButtons(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [activeSegments.length, showDefault]);

  if (loading || !segments) return null;

  const labelMap: Record<string, string> = {
    op: 'Skip Opening',
    ed: 'Skip Ending',
    recap: 'Skip Recap',
  };

  const shouldShowDefault = activeSegments.length === 0 && showDefault;

  if (activeSegments.length === 0 && !shouldShowDefault) return null;

  const renderNextEpisodeButton = () => {
    return <PlayerSkipButton title="Next Episode" LeftIcon={ChevronsRight} onPress={onNextEpisode} />;
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: FRAME_MARGIN / 2 + 90,
        right: FRAME_MARGIN * 2,
        flexDirection: 'row',
        gap: 5,
      }}
    >
      {activeSegments.length > 0 && showAniSkipButtons ? (
        <>
          {activeSegments.map((seg, idx) => (
            <PlayerSkipButton
              key={`${seg.skipType}-${idx}`}
              title={labelMap[seg.skipType]}
              LeftIcon={SkipForward}
              onPress={() => onSkip(seg.interval[1])}
            />
          ))}

          {hasSkipEnding && renderNextEpisodeButton()}
        </>
      ) : shouldShowDefault && store.displayCustomSkipButton ? (
        <PlayerSkipButton
          title={`Skip ${store.defaultSkipTime}s`}
          LeftIcon={SkipForward}
          onPress={() => onSkip(currentTime + store.defaultSkipTime)}
        />
      ) : null}
    </View>
  );
};
