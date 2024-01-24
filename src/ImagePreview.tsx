import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ImagePreviewProps } from './types';
import Zoom from './Zoom';

const { width } = Dimensions.get('window');

const ImagePreview = ({
  index,
  isSelected,
  item,
  renderCustomImage,
  resizeMode,
  onPress,
  onZoomBegin,
}: ImagePreviewProps) => {
  return (
    <Zoom onZoomBegin={onZoomBegin}>
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
    </Zoom>
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
