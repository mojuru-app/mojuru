import env from '@/env.json';
import { useStore } from '@/hooks/useStore';
import { getViewerId } from '@/modules/anilist';
import * as auth from 'expo-auth-session';
import * as Updates from 'expo-updates';
import { useCallback, useEffect } from 'react';
import { useFullScreenLoader } from '../FullScreenLoader';
import useTheme from '../useTheme';

export function useAniListAuth() {
  const { store, setStoreItem, removeStoreItem } = useStore();
  const { showLoader, updateLoader, hideLoader } = useFullScreenLoader();
  const { theme } = useTheme();

  const [request, response, promptAsync] = auth.useAuthRequest(
    {
      clientId: env.ANILIST_CLIENT_ID,
      clientSecret: env.ANILIST_CLIENT_SECRET,
      redirectUri: env.ANILIST_REDIRECT_URI,
      responseType: 'code',
    },
    { authorizationEndpoint: 'https://anilist.co/api/v2/oauth/authorize' }
  );

  const fetchAndStoreAuthData = useCallback(
    async (response: any) => {
      showLoader('Authenticating...', theme.idle.toString());

      try {
        const { accessToken } = await auth.exchangeCodeAsync(
          {
            clientId: env.ANILIST_CLIENT_ID,
            clientSecret: env.ANILIST_CLIENT_SECRET,
            redirectUri: env.ANILIST_REDIRECT_URI,
            code: response.params.code,
          },
          { tokenEndpoint: 'https://anilist.co/api/v2/oauth/token' }
        );

        const viewerId = await getViewerId(accessToken);

        await setStoreItem('access_token', accessToken);
        await setStoreItem('anilist_viewer_id', viewerId);

        updateLoader(
          'Authentication successful! Rebooting the app...\nIf nothing happens, please close and reopen it manually.',
          theme.success.toString()
        );

        await Updates.reloadAsync();
      } catch (error) {
        hideLoader();
        alert('Error authenticating with AniList.');
        console.error('Error authenticating with AniList:', error);

        removeStoreItem('access_token');
        removeStoreItem('anilist_viewer_id');
      }
    },
    [env, setStoreItem]
  );

  const logoutOfAniList = async () => {
    try {
      await removeStoreItem('access_token');

      showLoader(
        'Logout successful! Rebooting the app...\nIf nothing happens, please close and reopen it manually.',
        theme.success.toString()
      );

      setStoreItem('landing', true);

      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error loggint out of AniList:', error);
      alert('Error loggint out of AniList.');
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      fetchAndStoreAuthData(response);
    }
  }, [response]);

  return {
    anilistAccessToken: store.access_token,
    anilistViewerId: store.anilist_viewer_id,
    loginWithAniList: promptAsync,
    logoutOfAniList,
    isLoggedInWithAniList: !!store.access_token,
    request,
  };
}


// import env from '@/env.json';
// import { useStore } from '@/hooks/useStore';
// import { getViewerId } from '@/modules/anilist';
// // import * as auth from 'expo-auth-session';
// import * as Updates from 'expo-updates';
// import { useCallback, useEffect } from 'react';
// import { useFullScreenLoader } from '../FullScreenLoader';
// import useTheme from '../useTheme';

// export function useAniListAuth() {
//   const { store, setStoreItem, removeStoreItem } = useStore();
//   const { showLoader, updateLoader, hideLoader } = useFullScreenLoader();
//   const { theme } = useTheme();

//   return {
//     anilistAccessToken: "",
//     anilistViewerId: 0,
//     loginWithAniList: () => {},
//     logoutOfAniList: () => {},
//     isLoggedInWithAniList: false,
//     request: "",
//   };
// }
