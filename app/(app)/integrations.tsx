import Frame from '@/components/Frame';
import Txt from '@/components/ui/Txt';
import { BORDER_RADIUS, FRAME_MARGIN, INTEGRATIONS } from '@/constants/Utils';
import useTheme from '@/hooks/useTheme';
import { openUrlWithConfirmation } from '@/modules/utils/link';
import { Link, SquareArrowOutUpRight } from 'lucide-react-native';
import { FlatList, TouchableOpacity, View } from 'react-native';

export default function Integrations() {
  const { theme } = useTheme();

  return (
    <Frame
      bigHeading="Integrations"
      showCollapsibleHeader
      collapsibleHeaderText="Integrations"
      backButton
    >
      <View style={{ marginHorizontal: FRAME_MARGIN, marginBottom: FRAME_MARGIN * 3 }}>
        <FlatList
          data={INTEGRATIONS}
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
              onPress={() => {
                openUrlWithConfirmation(item.url);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Txt style={{ fontSize: 16, color: theme.textSupporting, fontFamily: 'Medium' }}>
                    {item.name}
                  </Txt>
                </View>
                <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Txt
                    style={{
                      fontSize: 15,
                      color: item.url ? theme.textShy : theme.textMuted,
                      fontFamily: 'Medium',
                      // backgroundColor: theme.foreground,
                      // borderRadius: BORDER_RADIUS,
                    }}
                  >
                    Source
                  </Txt>
                  <SquareArrowOutUpRight color={theme.textShy} size={15} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Frame>
  );
}
