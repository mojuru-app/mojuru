import useTheme from "@/hooks/useTheme";
import React, { useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import RenderHTML from "react-native-render-html";

interface MemoizedHTMLDescriptionProps {
  description?: string;
  width: any;
}

const MemoizedHTMLDescription: React.FC<MemoizedHTMLDescriptionProps> = ({
  description = "",
  width,
}) => {
  const { theme } = useTheme();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const renderedHTML = useMemo(
    () => (
      <RenderHTML
        contentWidth={width}
        source={{ html: description }}
        baseStyle={{
          // fontFamily: "Medium",
          // fontWeight: '400',
          color: theme.textShy,
          fontSize: 14,
          lineHeight: 18,
        }}
        tagsStyles={{
          p: { lineHeight: 18 },
        }}
        defaultTextProps={{
          numberOfLines: isExpanded ? undefined : 5,
          ellipsizeMode: "tail",
        }}
      />
    ),
    [isExpanded, description, width]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      {renderedHTML}
    </TouchableOpacity>
  );
};

export default MemoizedHTMLDescription;
