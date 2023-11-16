import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
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
    <Zoom>
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
    width: width - 10,
    borderRadius: 20,
  },
});

export default ImagePreview;
