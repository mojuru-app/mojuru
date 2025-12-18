import { userListsAtom } from "@/atoms";
import MediaGrid from "@/components/media/MediaGrid";
import BigHeading from "@/components/ui/BigHeading";
import FilterList, { Filter } from "@/components/ui/FilterList";
import Txt from "@/components/ui/Txt";
import { FRAME_MARGIN, TAB_BAR_HEIGHT } from "@/constants/Utils";
import { useAniListAuth } from "@/hooks/auth/useAniListAuth";
import useTheme from "@/hooks/useTheme";
import { useAtomValue } from "jotai";
import { CircleAlert, Frown } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export default function LibaryScreen() {
  const { isLoggedInWithAniList } = useAniListAuth();
  const { theme } = useTheme();

  const userListsIdAtomValue = useAtomValue(userListsAtom);

  const [filter, setFilter] = useState<string>("");

  if (!isLoggedInWithAniList)
    return (
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          gap: 10,
          height: "100%",
        }}
      >
        <Frown
          color={theme.textMuted}
          size={30}
          style={{ alignSelf: "center" }}
        />
        <Txt
          style={{
            width: "75%",
            alignSelf: "center",
            textAlign: "center",
            fontFamily: "Medium",
            color: theme.textMuted,
          }}
        >
          Looks like you are not authenticated!
        </Txt>
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        // paddingBottom: TAB_BAR_HEIGHT,
        marginBottom: TAB_BAR_HEIGHT,
      }}
    >
      <BigHeading text="Library" />

      <FilterList
        filters={[
          {
            label: "All",
            value: "",
          },
          {
            label: "Watching",
            value: "CURRENT",
          },
          {
            label: "Rewatching",
            value: "REPEATING",
          },
          {
            label: "Plan To Watch",
            value: "PLANNING",
          },
          {
            label: "Finished",
            value: "COMPLETED",
          },
        ]}
        onSelect={(filter: Filter) => {
          setFilter(filter.value);
        }}
      />

      <MediaGrid
        mediaList={[
          ...(userListsIdAtomValue?.CURRENT || []),
          ...(userListsIdAtomValue?.REPEATING || []),
          ...(userListsIdAtomValue?.PLANNING || []),
          ...(userListsIdAtomValue?.COMPLETED || []),
        ]}
        provider={"anilist"}
        filter={filter}
        withHorizontalMargin
      />
    </View>
  );
}
