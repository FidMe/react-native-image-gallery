import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ImagePreviewProps } from './types';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

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
          <ImageZoom
            resizeMode={resizeMode}
            source={item.source}
            style={styles.image}
          />
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
