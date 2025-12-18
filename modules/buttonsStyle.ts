import { ThemeColor } from "@/constants/Colors";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const getButtonStyle = (theme: ThemeColor, type: string) => {
  switch (type) {
    case "primary":
      return {
        backgroundColor: theme.primary,
      };
    case "destructive":
      return {
        backgroundColor: theme.alert,
      };
    case "outline":
      return {
        backgroundColor: theme.transparent,
        borderWidth: 1,
        borderColor: theme.text,
      };
    case "ghost":
      return {
        backgroundColor: theme.transparent,
      };
  }
};

export const getTextStyle = (theme: ThemeColor, type: string) => {
  switch (type) {
    case "primary":
      return {
        color: "black",
      };
    case "destructive":
      return {
        color: "black",
      };
    case "outline":
      return {
        color: theme.text,
      };
    case "ghost":
      return {
        color: theme.text,
      };
  }
};

export const useButtonPressAnimation = (customScale?: number) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    // scale.value = withTiming(customScale ?? 0.85, { duration: 70 });
    opacity.value = withTiming(0.5, { duration: 70 });
  };

  const handlePressOut = () => {
    // scale.value = 1;
    opacity.value = 1;
  };

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};
