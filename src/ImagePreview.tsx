import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ImagePreviewProps } from './types';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

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
          <ReactNativeZoomableView
            maxZoom={1.5}
            minZoom={0.5}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            style={{
              padding: 10,
              backgroundColor: 'red',
            }}
          >
            <Image
              resizeMode={resizeMode}
              source={item.source}
              style={styles.image}
            />
          </ReactNativeZoomableView>
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
