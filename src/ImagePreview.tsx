import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ImagePreviewProps } from './types';
import Zoom from 'react-native-zoom-reanimated';

const { height, width } = Dimensions.get('window');

const ImagePreview = ({
  index,
  isSelected,
  item,
  renderCustomImage,
  resizeMode,
  onPress,
}: ImagePreviewProps) => {
  return (
    <TouchableWithoutFeedback onPress={() => onPress?.(item)}>
      <View style={styles.containerStyle}>
        {renderCustomImage ? (
          renderCustomImage(item, index, isSelected)
        ) : (
          <Zoom>
            <Image
              resizeMode={resizeMode}
              source={item.source}
              style={styles.image}
            />
          </Zoom>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    height: height * 0.8,
    width,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});

export default ImagePreview;
