import { BORDER_RADIUS } from "@/constants/Utils";
import useTheme from "@/hooks/useTheme";
import { Search, X } from "lucide-react-native";
import React, { useEffect, useState, forwardRef } from "react";
import {
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
} from "react-native";

interface SearchBarProps {
  style?: ViewStyle;
  onChangeText: (text: string) => void;
  onDebounceChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ style, onChangeText, onDebounceChangeText, placeholder }, ref) => {
    const { theme } = useTheme();
    const [text, setText] = useState("");
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleTextChange = (inputText: string) => {
      setText(inputText);
      onChangeText(inputText);

      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      const newTimeout = setTimeout(() => {
        onDebounceChangeText(inputText);
      }, 1000);

      setDebounceTimeout(newTimeout);
    };

    const clearText = () => {
      setText("");
      onChangeText("");
      onDebounceChangeText("");

      if (ref && typeof ref !== "function") {
        ref.current?.focus();
      }
    };

    useEffect(() => {
      return () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
      };
    }, [debounceTimeout]);

    return (
      <View
        style={[
          {
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: BORDER_RADIUS * 2,
            backgroundColor: "#FFFFFF10",
            paddingHorizontal: 8,
            width: "100%",
          },
          style,
        ]}
      >
        <Search size={20} color={theme.textShy} />

        <TextInput
          ref={ref}
          pointerEvents="auto"
          style={
            {
              color: theme.text,
              fontSize: 14,
              flex: 1,
              marginLeft: 7,
              paddingVertical: 10,
              paddingRight: 30,
              fontFamily: "SemiBold",
            } as TextStyle
          }
          cursorColor={theme.primary}
          selectionColor={theme.primary}
          onChangeText={handleTextChange}
          value={text}
          placeholder={placeholder}
          placeholderTextColor={theme.textShy}
        />

        {text.length > 0 && (
          <TouchableOpacity
            onPress={clearText}
            style={{
              position: "absolute",
              right: 0,
              padding: 8,
            }}
          >
            <X size={20} color={theme.textShy} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

export default SearchBar;
