import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThumbnailProps } from '../types';

const Thumbnail = ({
  item,
  index,
  isSelected,
  thumbSize,
  thumbColor,
  thumbResizeMode,
  onPress,
  renderCustomThumb,
}: ThumbnailProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.8}>
      {renderCustomThumb ? (
        renderCustomThumb(item, index, isSelected)
      ) : (
        <Image
          resizeMode={thumbResizeMode}
          style={[
            styles.thumb,
            { width: thumbSize, height: thumbSize },
            isSelected && [styles.activeThumb, { borderColor: thumbColor }],
          ]}
          source={item.thumbnail?.source ? item.thumbnail.source : item.source}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  thumb: {
    borderRadius: 12,
  },
  activeThumb: {
    borderWidth: 3,
  },
});

export default Thumbnail;
