import { ANIME_ENTRY_HEIGHT, ANIME_ENTRY_WIDTH } from '@/constants/Utils';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Txt from '../ui/Txt';
import useTheme from '@/hooks/useTheme';

interface CollageProps {
  images: string[][];
}

const Collage: React.FC<CollageProps> = ({ images }) => {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();

  const gap = 10;
  const imageSizeRatio = 1;
  const imageWidth = ANIME_ENTRY_WIDTH * imageSizeRatio;
  const imageHeight = ANIME_ENTRY_HEIGHT * imageSizeRatio;

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      width: width * 5,
      opacity: 0.4,
      flexDirection: 'column',
      marginTop: -height * 2,
      marginLeft: -width * 2,
      flexWrap: 'wrap',
      gap: gap,
      transform: [{ rotate: '-20deg' }],
    },
    row: {
      gap: gap,
    },
    image: {
      width: imageWidth,
      height: imageHeight,
      marginBottom: 0,
      borderRadius: 10,
      backgroundColor: theme.mist,
    },
  });

  return (
    <View style={styles.container}>
      {images.map((col, index1) => (
        <View
          key={index1}
          style={[styles.row, { marginTop: index1 % 2 !== 0 ? -((imageHeight + gap) / 2) : 0 }]}
        >
          {col.map((image, index2) => {
            return (
              <View key={index2} style={{ position: 'relative' }}>
                <Image source={{ uri: image }} style={[styles.image]} resizeMode="cover" />
                {/* <Txt
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    color: 'black',
                    fontFamily: 'ExtraBold',
                    fontSize: 24,
                    backgroundColor: 'white',
                    padding: 5,
                    borderRadius: '100%',
                  }}
                >
                  {index2}
                </Txt> */}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default Collage;
