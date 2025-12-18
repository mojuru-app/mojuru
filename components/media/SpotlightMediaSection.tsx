import { userListsAtom } from '@/atoms';
import { FORMATS } from '@/constants/Anilist';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import useDynColors from '@/hooks/useDynColors';
import { useMedia } from '@/hooks/useMedia';
import { useSearchMatchFromPluginAndPlay } from '@/hooks/useSearchMatchFromPluginAndPlay';
import useTheme from '@/hooks/useTheme';
import { MediaProvider } from '@/models/mediaData';
import { addMediaToLibrary, removeMediaFromLibrary } from '@/modules/mediaSync';
import { getContrastYIQ } from '@/modules/utils/color';
import { hapticVibrate } from '@/modules/utils/haptics';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Check, Info, Play, Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button, IconLabelButton } from '../ui/Buttons';
import Txt from '../ui/Txt';
import { useResolvedPlugin } from '@/lib/plugins/useResolvedPlugin';
import { usePluginManager } from '@/lib/plugins/usePluginManager';

const SpotlightMediaSection: React.FC<{
  id: string;
  provider: MediaProvider;
}> = ({ id, provider }) => {
  // this section is always anilist
  const { allPlugins } = usePluginManager();
  const { plugin } = useResolvedPlugin();
  const { searchMatchFromPluginAndPlay } = useSearchMatchFromPluginAndPlay(plugin ?? undefined);
  const { isLoggedInWithAniList } = useAniListAuth();
  const { theme } = useTheme();

  const { getMedia, ensureMedia } = useMedia();
  const media = getMedia(provider, id)!;

  const { dynColors } = useDynColors(media);
  const [_, setUserLists] = useAtom(userListsAtom);

  const hasProviderPlugins = useMemo(
    () => allPlugins.some((p) => p.metadata.pluginType === 'provider'),
    [allPlugins]
  );

  const [toggleLibraryLoading, setToggleLibraryLoading] = useState<boolean>(false);
  const [isInLibrary, setIsInLibrary] = useState<boolean>(
    !!(
      media?.mediaListEntry?.status === 'PLANNING' ||
      media?.mediaListEntry?.status === 'CURRENT' ||
      media?.mediaListEntry?.status === 'REPEATING'
    )
  );
  const [info, setInfo] = useState<string>();

  useEffect(() => {
    setIsInLibrary(
      !!(
        media?.mediaListEntry?.status === 'PLANNING' ||
        media?.mediaListEntry?.status === 'CURRENT' ||
        media?.mediaListEntry?.status === 'REPEATING'
      )
    );
  }, [media?.mediaListEntry]);

  useEffect(() => {
    const getParsedInfo = () => {
      return [
        ...[media?.startDate?.year],
        ...[
          media?.genres
            ? media.genres[Math.floor(Math.random() * Math.min(media.genres.length, 3))]
            : '',
        ],
        ...[FORMATS.find((format) => format.value === media?.format)?.label],
      ].join('     ');
    };

    setInfo(getParsedInfo());
  }, [media]);

  const handleInfoPress = () => {
    ensureMedia(provider, media);

    router.push({
      pathname: `/media-page/[id]`,
      params: { id: media.id, provider },
    });
  };

  const toggleLibrary = async () => {
    try {
      setToggleLibraryLoading(true);

      if (isInLibrary) {
        const removed = await removeMediaFromLibrary(setUserLists, media);
        if (removed) setIsInLibrary(false);
      } else {
        const added = await addMediaToLibrary(setUserLists, media);
        setIsInLibrary(added);
      }
    } finally {
      setToggleLibraryLoading(false);
    }
  };

  const startMatching = async () => {
    searchMatchFromPluginAndPlay({ media, number: 1 });
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          top: -20,
          alignItems: 'center',
          gap: 5,
        }}
      >
        <Txt
          style={{
            fontFamily: 'Bold',
            maxWidth: '80%',
            fontSize: 26,
            textAlign: 'center',
          }}
        >
          {media.title}
        </Txt>

        <Txt
          style={{
            fontFamily: 'SemiBold',
            fontSize: 14,
            textAlign: 'center',
            color: theme.textSupporting,
            marginBottom: 5,
          }}
        >
          {info}
        </Txt>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <View style={{ width: '20%' }}>
            {isLoggedInWithAniList &&
              (toggleLibraryLoading ? (
                <ActivityIndicator color={theme.text} />
              ) : isInLibrary ? (
                <IconLabelButton
                  title="Saved"
                  Icon={Check}
                  accent={dynColors.primary}
                  onPress={() => {
                    hapticVibrate();
                    toggleLibrary();
                  }}
                />
              ) : (
                <IconLabelButton
                  title="Save"
                  Icon={Plus}
                  onPress={() => {
                    hapticVibrate();
                    toggleLibrary();
                  }}
                />
              ))}
          </View>

          {hasProviderPlugins && (
            <View style={{ width: '40%' }}>
              <Button
                title="Watch Now"
                LeftIcon={Play}
                bg={dynColors.primary}
                accent={getContrastYIQ(dynColors.primary)}
                onPress={() => {
                  startMatching();
                }}
              />
            </View>
          )}

          <View style={{ width: '20%' }}>
            <IconLabelButton onPress={handleInfoPress} title="Info" Icon={Info} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default SpotlightMediaSection;
