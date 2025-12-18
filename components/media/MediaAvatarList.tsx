import React from "react";
import { View, Text, Image, FlatList } from "react-native";
import LazyFlatList from "../ui/LazyFlatList";
import useTheme from "@/hooks/useTheme";
import Heading from "../ui/Heading";
import Txt from "../ui/Txt";
import { BORDER_RADIUS, FRAME_MARGIN } from "@/constants/Utils";

export type MediaAvatarItem = {
  image?: string;
  title: string;
  subtitle?: string;
};

type MediaAvatarListProps = {
  items: MediaAvatarItem[];
};

export const MediaAvatarList: React.FC<MediaAvatarListProps> = ({ items }) => {
  const { theme } = useTheme();

  if (!items) return null;

  return (
    <>
      <Txt
        style={{
          color: theme.textMuted,
          fontSize: 12,
          fontFamily: "SemiBold",
          textTransform: "uppercase",
        }}
      >
        CHARACTERS
      </Txt>

      <LazyFlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{}}
        style={{
          marginHorizontal: -FRAME_MARGIN,
          paddingHorizontal: FRAME_MARGIN,
        }}
        ItemSeparatorComponent={() => <View style={{ width: 5 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              width: 80,
              alignItems: "center",
              borderRadius: 16,
            }}
          >
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: BORDER_RADIUS * 2,
                  marginBottom: 8,
                }}
                resizeMode="cover"
              />
            )}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                textAlign: "center",
                color: theme.textShy,
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  textAlign: "center",
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        )}
      />
    </>
  );
};
