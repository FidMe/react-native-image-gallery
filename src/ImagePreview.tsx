import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ImagePreviewProps } from './types';

const { width } = Dimensions.get('window');

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
          <Image
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
  containerStyle: {},
  image: {
    height: '100%',
    width,
  },
});

export default ImagePreview;
