import useTheme from '@/hooks/useTheme';
import { Stack } from 'expo-router';

export default function LandingLayout() {
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
      <Stack.Screen name="landing" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
