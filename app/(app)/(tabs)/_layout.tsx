import { userInfoAtom } from '@/atoms';
import { TabBarBackground, TabBarComponent } from '@/components/navigation/TabBarElements';
import { useAniListAuth } from '@/hooks/auth/useAniListAuth';
import { useStore } from '@/hooks/useStore';
import useTheme from '@/hooks/useTheme';
import { getUserInfo } from '@/modules/anilist';
import { Tabs } from 'expo-router';
import { useSetAtom } from 'jotai';
import { Blocks, Bookmark, Cog, House, Search } from 'lucide-react-native';
import React, { useEffect } from 'react';

export default function TabLayout() {
  const { isLoggedInWithAniList, anilistViewerId } = useAniListAuth();

  const setUserInfo = useSetAtom(userInfoAtom);

  const { store } = useStore();
  const { theme, changeTheme } = useTheme();

  // set default theme from store
  useEffect(() => {
    changeTheme(store.theme);
  }, []);

  // fetch user media lists from anilist
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo(anilistViewerId);
      setUserInfo(userInfo);
    };

    if (!isLoggedInWithAniList) return;

    fetchUserInfo();
  }, [isLoggedInWithAniList]);

  return (
    <Tabs
      screenOptions={() => ({
        sceneStyle: {
          backgroundColor: theme.background,
        },
        tabBarActiveTintColor: theme.primary.toString(),
        headerShown: false,
        tabBarStyle: {
          flex: 1,
          position: 'absolute',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          borderTopWidth: 0,
        },
        tabBarBackground: () => <TabBarBackground bg={`${theme.foreground.toString()}A9`} />,
      })}
    >
      <Tabs.Screen
        name="index"
        options={({ route }) => ({
          title: 'Home',
          tabBarButton: ({ onPress, "aria-selected": selected }) => (
            <TabBarComponent
              Icon={House}
              focused={selected ?? false}
              title="Home"
              onPress={onPress}
            />
          ),
        })}
      />

      <Tabs.Screen
        name="search"
        options={({ route }) => ({
          title: 'Search',
          tabBarButton: ({ onPress, "aria-selected": selected }) => (
            <TabBarComponent
              Icon={Search}
              focused={selected ?? false}
              title="Search"
              focusedEffect="stroke"
              onPress={onPress}
            />
          ),
        })}
      />

      <Tabs.Screen
        name="library"
        options={({ route }) => ({
          title: 'Library',
          contentStyle: {
            backgroundColor: theme.background,
          },
          tabBarButton: ({ onPress, "aria-selected": selected }) => (
            <TabBarComponent
              Icon={Bookmark}
              focused={selected ?? false}
              title="Library"
              onPress={onPress}
            />
          ),
        })}
      />

      <Tabs.Screen
        name="plugins"
        options={({ route }) => ({
          title: 'Plugins',
          contentStyle: {
            backgroundColor: theme.background,
          },
          tabBarButton: ({ onPress, "aria-selected": selected }) => (
            <TabBarComponent
              Icon={Blocks}
              focused={selected ?? false}
              title="Plugins"
              onPress={onPress}
            />
          ),
        })}
      />

      <Tabs.Screen
        name="settings"
        options={({ route }) => ({
          title: 'Settings',
          contentStyle: {
            backgroundColor: theme.background,
          },
          tabBarButton: ({ onPress, "aria-selected": selected }) => (
            <TabBarComponent
              Icon={Cog}
              focused={selected ?? false}
              title="Settings"
              focusedEffect="stroke"
              onPress={onPress}
            />
          ),
        })}
      />
    </Tabs>
  );
}
