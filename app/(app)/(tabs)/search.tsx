import Frame from "@/components/Frame";
import MediaGrid from "@/components/media/MediaGrid";
import BigHeading from "@/components/ui/BigHeading";
import SearchBar from "@/components/ui/SearchBar";
import { FRAME_MARGIN, TAB_BAR_HEIGHT } from "@/constants/Utils";
import { AnimeData } from "@/models/anilist";
import { searchFilteredAnime } from "@/modules/anilist";
import { getMediaDataSource } from "@/modules/mediaInfoAdapters/mediaDataFactory";
import React, { useRef, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";

export default function ExploreScreen() {
  const [animeData, setAnimeData] = useState<AnimeData>();
  const [loading, setLoading] = useState<boolean>(false);

  const anilistDataSource = getMediaDataSource("anilist");

  const searchBarRef = useRef<TextInput>(null);

  const handleDebouncedSearch = async (query: string) => {
    if (query === "") {
      setAnimeData(undefined);
      setLoading(false);

      searchBarRef.current?.focus();

      return;
    }

    setLoading(true);

    try {
      const pages = await searchFilteredAnime(
        `search: "${query}", type: ANIME`
      );
      setAnimeData(pages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Frame
      bigHeading="Search"
      showCollapsibleHeader
      collapsibleHeaderText="Search"
      scrollable={false}
      isTab
    >
      <View style={{ marginHorizontal: FRAME_MARGIN }}>
        <SearchBar
          ref={searchBarRef}
          onChangeText={() => setLoading(true)}
          onDebounceChangeText={handleDebouncedSearch}
          placeholder="Search..."
        />
      </View>

      <View style={{ flex: 1, marginTop: 20 }}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <MediaGrid
            mediaList={anilistDataSource.convertList(animeData?.media || [])}
            provider={"anilist"}
          />
        )}
      </View>
    </Frame>
  );
}
