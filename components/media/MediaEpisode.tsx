import { userListsAtom } from '@/atoms';
import { BORDER_RADIUS, MODAL_MARGIN } from '@/constants/Utils';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { MediaData, MediaEpisodeCover } from '@/models/mediaData';
import { parseLength, parseSummary, parseTitle } from '@/modules/anizip';
import { updateAnimeProgress } from '@/modules/mediaSync';
import { hapticVibrate } from '@/modules/utils/haptics';
import { useAtom } from 'jotai';
import { EllipsisVertical, ListCheck, Play } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, DimensionValue, Image, TouchableOpacity, View } from 'react-native';

import ActionsModal from '../ui/ActionsModal';
import { IconCircleButton } from '../ui/Buttons';
import Txt from '../ui/Txt';

const MediaEpisode: React.FC<{
  media: MediaData;
  number: number;
  banner?: string;
  coverColor?: string;
  primaryColor?: string;
  episodeCover?: MediaEpisodeCover;
  episodeProgress?: {
    progress: number;
    duration: number;
  };
  insidePlayer?: boolean;
  onPress: () => void;
}> = ({
  media,
  number,
  episodeCover,
  banner,
  coverColor,
  primaryColor,
  episodeProgress,
  insidePlayer = false,
  onPress,
}) => {
  const { theme } = useTheme();
  const { store } = useStore();
  const { smallerSize } = useScreenSize();

  const [_, setUserLists] = useAtom(userListsAtom);

  const parsedTitle = parseTitle(episodeCover, number);
  const parsedLength = parseLength(episodeCover);
  const parsedSummary = parseSummary(episodeCover);

  const [episodeActionsModalVisible, setEpisodeActionsModalVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleOpenEpisodeActionModal = () => {
    if (insidePlayer) return;

    hapticVibrate();
    setEpisodeActionsModalVisible(true);
  };

  const handleUpdateProgressToThisEpisode = async () => {
    hapticVibrate();
    Alert.alert(
      'Update Progress',
      `Are you sure you want to set your progress to episode ${number}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            if (media.mediaListEntry?.status === undefined) {
              alert('You need to add this media to your library before updating progress.');
              return;
            }

            const updated = await updateAnimeProgress(media, setUserLists, number);

            if (updated) {
              alert(`Progress updated to episode ${number}.`);
            } else {
              alert('Something went wrong. Please try again.');
            }
          },
          style: 'default',
        },
      ]
    );
  };

  return (
    <>
      <ActionsModal
        visible={episodeActionsModalVisible}
        topChildren={
          <View
            style={{
              width: smallerSize - 2 * MODAL_MARGIN,
              gap: 15,
            }}
          >
            <Image
              source={{ uri: episodeCover?.image ?? banner }}
              resizeMode="cover"
              style={{
                width: smallerSize - 2 * MODAL_MARGIN,
                aspectRatio: 16 / 9,
                backgroundColor: coverColor ?? theme.foreground,
                borderRadius: BORDER_RADIUS,
              }}
            />

            <View style={{ gap: 3 }}>
              <Txt
                style={{
                  fontFamily: 'Bold',
                  color: theme.text,
                  fontSize: 20,
                  marginBottom: 5,
                }}
              >
                {parsedTitle}
              </Txt>

              <Txt
                style={{
                  fontFamily: 'SemiBold',
                  color: theme.textMuted,
                  fontSize: 14,
                }}
              >
                {parsedLength}
              </Txt>

              <TouchableOpacity activeOpacity={0.8} onPress={() => setIsExpanded(!isExpanded)}>
                <Txt
                  style={{
                    fontFamily: 'Medium',
                    color: theme.textShy,
                    fontSize: 14,
                  }}
                  numberOfLines={isExpanded ? undefined : 5}
                  ellipsizeMode="tail"
                >
                  {parsedSummary}
                </Txt>
              </TouchableOpacity>
            </View>
          </View>
        }
        actions={[
          {
            label: 'Update progress to this episode',
            Icon: ListCheck,
            onPress: handleUpdateProgressToThisEpisode,
          },
        ]}
        onClose={() => {
          setEpisodeActionsModalVisible(false);
        }}
      />

      <TouchableOpacity
        activeOpacity={1}
        onLongPress={handleOpenEpisodeActionModal}
        style={{
          flexDirection: 'column',
          gap: 7,
          width: insidePlayer ? 250 : '100%',
          marginRight: insidePlayer ? 20 : 0,
          marginBottom: insidePlayer ? 0 : 22,
          borderRadius: BORDER_RADIUS,
        }}
      >
        <View
          style={{
            flexDirection: insidePlayer ? 'column' : 'row',
            gap: 9,
            width: '100%',
          }}
        >
          <View
            style={{
              position: 'relative',
              height: insidePlayer ? 250 / 1.78 : 70,
              width: insidePlayer ? 250 : 70 * 1.78,
              borderRadius: BORDER_RADIUS,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={onPress}
              style={{
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: episodeCover?.image ?? banner }}
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: coverColor ?? theme.foreground,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: '100%',
                  transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
                  backgroundColor: `#00000080`,
                  borderWidth: 1.5,
                  borderColor: `#99999960`,
                }}
              >
                <Play fill={theme.text} color={theme.text} size={14} style={{marginLeft: 1}} />
              </View>
            </TouchableOpacity>

            {episodeProgress && (
              <>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    backgroundColor: '#aeaeae70',
                  }}
                />

                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: `${(
                      100 *
                      (episodeProgress.progress / episodeProgress.duration)
                    ).toString()}%` as DimensionValue,
                    height: 4,
                    backgroundColor: primaryColor,
                  }}
                />
              </>
            )}
          </View>

          <View
            style={{
              flexShrink: 1,
              flexDirection: insidePlayer ? 'row' : 'column',
              justifyContent: insidePlayer ? 'space-between' : 'center',
              marginRight: insidePlayer ? 0 : 30,
            }}
          >
            <Txt
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ width: insidePlayer ? '80%' : undefined }}
            >
              <Txt
                style={{
                  fontFamily: 'SemiBold',
                  color: theme.textMuted,
                  fontSize: 14,
                }}
              >
                {`${number}.  `}
              </Txt>
              <Txt
                style={{
                  fontFamily: 'SemiBold',
                  color: theme.textShy,
                  fontSize: 14,
                }}
              >
                {parsedTitle}
              </Txt>
            </Txt>

            {episodeCover && episodeCover.length && (
              <Txt
                style={{
                  fontFamily: 'Medium',
                  color: theme.textMuted,
                  fontSize: 13,
                  marginTop: insidePlayer ? 0 : 2,
                  textAlign: insidePlayer ? 'right' : undefined,
                  width: insidePlayer ? '20%' : undefined,
                }}
              >
                {parsedLength}
              </Txt>
            )}
          </View>

          {!insidePlayer && (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                transform: [{ translateY: '-50%' }],
              }}
            >
              <IconCircleButton Icon={EllipsisVertical} onPress={handleOpenEpisodeActionModal} />
            </View>
          )}
        </View>

        {!store.hideDetails && (
          <Txt
            style={{
              fontFamily: 'Medium',
              color: insidePlayer ? theme.textMuted : theme.textShy,
              fontSize: 13,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {parsedSummary}
          </Txt>
        )}
      </TouchableOpacity>
    </>
  );
};

export default MediaEpisode;
