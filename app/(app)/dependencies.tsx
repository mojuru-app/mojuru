import Frame from '@/components/Frame';
import Txt from '@/components/ui/Txt';
import { BORDER_RADIUS, DEPENDENCIES, FRAME_MARGIN } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { FlatList, TouchableOpacity, View } from 'react-native';

export default function Dependencies() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Frame
      bigHeading="Third-Party Licenses"
      showCollapsibleHeader
      collapsibleHeaderText="Third-Party Licenses"
      backButton
    >
      <View style={{ marginHorizontal: FRAME_MARGIN, marginBottom: FRAME_MARGIN * 3 }}>
        <FlatList
          data={DEPENDENCIES}
          scrollEnabled={false}
          keyExtractor={(item) => item.name}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: '#FFFFFF13',
                marginVertical: 4,
              }}
            />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ paddingVertical: 8 }}
              onPress={() =>
                router.push({
                  pathname: '/license/[name]',
                  params: { name: item.license },
                })
              }
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Txt style={{ fontSize: 16, color: theme.textSupporting, fontFamily: 'Medium', }}>{item.name}</Txt>
                  <Txt style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
                    v{item.version}
                  </Txt>
                </View>
                <Txt
                  style={{
                    fontSize: 15,
                    color: theme.textShy,
                    fontFamily: 'SemiBold',
                    backgroundColor: theme.foreground,
                    padding: 5,
                    borderRadius: BORDER_RADIUS
                  }}
                >
                  {item.license}
                </Txt>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Frame>
  );
}
