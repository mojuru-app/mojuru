import { IconCircleButton } from '@/components/ui/Buttons';
import Heading from '@/components/ui/Heading';
import Txt from '@/components/ui/Txt';
import { FRAME_MARGIN } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function whatIsSelectSourceScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        position: 'relative',
        marginHorizontal: FRAME_MARGIN,
        marginTop: 20,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -8,
          right: -8,
        }}
      >
        <IconCircleButton
          Icon={X}
          onPress={() => {
            router.back();
          }}
        />
      </View>

      <Txt
        style={{
          fontFamily: 'Bold',
          color: theme.text,
          fontSize: 24,
          marginBottom: 30,
        }}
      >
        What is this tool?
      </Txt>

      <Heading text="Media Selection" style={{ marginBottom: 10 }} />

      <Txt style={{ color: theme.textSupporting }}>
        When you choose to watch an episode, this tool will automatically try to match the AniList media with the
        correct one from the plugin provider.
        {`\n`}If the automatic matching doesn’t work or returns incorrect results, you can manually search within the
        provider to find the right episode.
      </Txt>
    </SafeAreaView>
  );
}
