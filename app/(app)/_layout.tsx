import useTheme from '@/hooks/useTheme';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen
        name="player"
        options={{
          presentation: 'containedModal',
          autoHideHomeIndicator: true,
          statusBarBackgroundColor: 'black',
          orientation: 'landscape',
        }}
      />
      <Stack.Screen name="premium-landing" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="media-page/[id]"
        options={{
          presentation: 'card',
        }}
        getId={({ params }: any) => JSON.stringify(params)}
      />
      <Stack.Screen name="plugin/[pluginId]/index" />
      <Stack.Screen
        name="plugin/[pluginId]/info"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="what-is-select-source" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
