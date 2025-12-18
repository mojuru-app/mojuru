import Collage from '@/components/media/Collage';
import { Button } from '@/components/ui/Buttons';
import Txt from '@/components/ui/Txt';
import { FRAME_MARGIN } from '@/constants/Utils';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { fetchRandomTrendingPosters } from '@/models/fetchAniListLists';
import { getContrastYIQ } from '@/modules/utils/color';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
  const { loginWithAniList, isLoggedInWithAniList } = useAniListAuth();
  const { setStoreItem } = useStore();
  const { theme } = useTheme();

  const [posters, setPosters] = useState<string[][]>();

  useEffect(() => {
    const fetchPosters = async () => {
      const p = await fetchRandomTrendingPosters();
      setPosters(p);
    };

    fetchPosters();
  }, []);

  const enterTheApp = () => {
    setStoreItem('landing', false);
    router.replace('/(app)/(tabs)');
  };

  if (!posters) return null;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
      }}
    >
      <Collage images={posters} />

      <LinearGradient
        colors={[
          theme.background.toString(),
          // theme.background.toString(),
          `${theme.background.toString()}E2`,
          'transparent',
        ]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      />

      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingHorizontal: FRAME_MARGIN,
          paddingBottom: 30,
        }}
      >
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Image
            source={require('@/assets/images/transparent-icon.png')}
            style={{ width: 90, height: 90, borderRadius: 20 }}
            resizeMode="contain"
          />

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 40,
              gap: 20,
            }}
          >
            <Txt style={{ fontSize: 28, fontFamily: 'Bold' }}>
              Welcome to{' '}
              <Txt
                style={{
                  color: theme.primary,
                  fontSize: 28,
                  fontFamily: 'Bold',
                }}
              >
                Mojuru
              </Txt>
            </Txt>

            <Txt
              style={{
                color: theme.textShy,
                fontSize: 15,
                fontFamily: 'Medium',
                textAlign: 'center',
                lineHeight: 23,
              }}
            >
              Load, stream, and experience your content like never before. Modular and flexible, for
              a personalized streaming journey.
            </Txt>
          </View>

          <View style={{ gap: 10, width: '100%' }}>
            {!isLoggedInWithAniList ? (
              <>
                <Button
                  title={'Login with AniList'}
                  LeftImage={"https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg"}
                  onPress={() => {
                    loginWithAniList();
                  }}
                  bg={theme.primary}
                  accent={getContrastYIQ(theme.primary.toString())}
                />
                <Button
                  title={'Enter as guest'}
                  onPress={enterTheApp}
                  bg={theme.foreground}
                  accent={theme.primary}
                />
              </>
            ) : (
              <Button
                title={'Continue'}
                onPress={enterTheApp}
                bg={theme.primary}
                accent={getContrastYIQ(theme.primary.toString())}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
