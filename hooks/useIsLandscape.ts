import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

const useIsLandscape = () => {
  const [isLandscape, setIsLandscape] = useState<boolean>(
    Dimensions.get("window").width > Dimensions.get("window").height
  );

  useEffect(() => {
    const onChange = () => {
      const { width, height } = Dimensions.get("window");
      setIsLandscape(width > height);
    };

    const subscription = Dimensions.addEventListener("change", onChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return isLandscape;
};

export default useIsLandscape;
