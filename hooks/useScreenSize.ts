import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

/**
 * get the larger and smaller dimensions of the screen.
 * it updates automatically when the screen size changes (e.g., on rotation).
 *
 * @returns an object containing:
 *  - `largerSize`: The larger dimension of the screen (width or height).
 *  - `smallerSize`: The smaller dimension of the screen (width or height).
 */
export function useScreenSize() {
  const [largerSize, setLargerSize] = useState(Dimensions.get("window").width);
  const [smallerSize, setSmallerSize] = useState(
    Dimensions.get("window").height
  );

  useEffect(() => {
    const updateSizes = () => {
      const { width, height } = Dimensions.get("window");
      setLargerSize(Math.max(width, height));
      setSmallerSize(Math.min(width, height));
    };

    const subscription = Dimensions.addEventListener("change", updateSizes);
    updateSizes();

    return () => subscription.remove();
  }, []);

  return { largerSize, smallerSize };
}
