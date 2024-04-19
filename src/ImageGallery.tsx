import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedRef,
  useDerivedValue,
} from 'react-native-reanimated';
import { ImageObject, IProps, RenderImageProps } from './types';
import ImagePreview from './ImagePreview';
import Zoom from './Zoom';

const { width: deviceWidth } = Dimensions.get('window');

const defaultProps = {
  hideThumbs: false,
  resizeMode: 'contain',
  thumbColor: '#d9b44a',
  thumbResizeMode: 'cover',
  thumbSize: 48,
  thumbOffset: 10,
  autoScroll: 0,
  disableAutoScroll: false,
  enableManualZoom: false,
};

const ImageGallery = (props: IProps & typeof defaultProps) => {
  const {
    hideThumbs,
    images,
    initialIndex,
    renderCustomImage,
    renderCustomThumb,
    renderFooterComponent,
    renderHeaderComponent,
    resizeMode,
    thumbColor,
    thumbResizeMode,
    thumbSize,
    thumbOffset,
    onEndReached,
    onPressPreviewImage,
    onPageChange,
    autoScroll,
    disableAutoScroll,
    enableManualZoom,
  } = props;

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoScrollActive, setAutoScrollActive] = useState(autoScroll > 0);
  const isManualZoomEnabled = useDerivedValue(
    () => !autoScrollActive && enableManualZoom,
    [autoScrollActive, enableManualZoom]
  );

  const topRef = useAnimatedRef<Animated.FlatList>();
  const bottomRef = useRef<FlatList>(null);

  const keyExtractorThumb = (item: ImageObject, index: number) =>
    item && item.id ? item.id.toString() : index.toString();
  const keyExtractorImage = (item: ImageObject, index: number) =>
    item && item.id ? item.id.toString() : index.toString();

  const scrollToIndex = (i: number, scrollTopView: boolean = false) => {
    const isValidIndex = Number.isFinite(i);

    if (!isValidIndex) {
      setAutoScrollActive(false);
    }

    if (isValidIndex && i !== activeIndex) {
      onPageChange?.(i);
      setActiveIndex(i);

      if (topRef?.current && scrollTopView) {
        topRef.current.scrollToIndex({
          animated: true,
          index: i,
        });
      }
      if (bottomRef?.current) {
        if (i * (thumbSize + 10) - thumbSize / 2 > deviceWidth / 2) {
          bottomRef?.current?.scrollToIndex({
            animated: true,
            index: i,
          });
        } else {
          bottomRef?.current?.scrollToIndex({
            animated: true,
            index: 0,
          });
        }
      }
    }
  };

  const renderItem = ({ item, index }: RenderImageProps) => {
    return (
      <ImagePreview
        index={index}
        isSelected={activeIndex === index}
        item={item}
        resizeMode={resizeMode}
        renderCustomImage={renderCustomImage}
        onPress={onPressPreviewImage}
      />
    );
  };

  const handleImagePreviewZoomBegin = () => {
    setAutoScrollActive(false);
  };

  const renderThumb = ({ item, index }: RenderImageProps) => {
    return (
      <TouchableOpacity
        onPress={() => scrollToIndex(index, true)}
        activeOpacity={0.8}
      >
        {renderCustomThumb ? (
          renderCustomThumb(item, index, activeIndex === index)
        ) : (
          <Image
            resizeMode={thumbResizeMode}
            style={
              activeIndex === index
                ? [
                    styles.thumb,
                    styles.activeThumb,
                    { borderColor: thumbColor },
                    { width: thumbSize, height: thumbSize },
                  ]
                : [styles.thumb, { width: thumbSize, height: thumbSize }]
            }
            source={
              item.thumbnail?.source ? item.thumbnail?.source : item.source
            }
          />
        )}
      </TouchableOpacity>
    );
  };

  const onMomentumEnd = (e: any) => {
    const { x } = e.nativeEvent.contentOffset;
    scrollToIndex(Math.round(x / deviceWidth));
  };

  useEffect(() => {
    let autoScrollTimer: number;

    if (autoScrollActive && !disableAutoScroll) {
      autoScrollTimer = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollToIndex(nextIndex, true);
        if (nextIndex === 0) {
          setAutoScrollActive(false);
        }
      }, autoScroll);
    }

    return () => {
      clearInterval(autoScrollTimer);
    };
  }, [activeIndex, autoScrollActive, disableAutoScroll]);

  useEffect(() => {
    if (initialIndex) {
      onPageChange?.(initialIndex);
      setActiveIndex(initialIndex);
    } else {
      onPageChange?.(0);
      setActiveIndex(0);
    }
  }, []);

  const getImageLayout = useCallback(
    (_, index) => {
      return {
        index,
        length: deviceWidth,
        offset: deviceWidth * index,
      };
    },
    [images]
  );

  const getThumbLayout = useCallback(
    (_, index) => {
      return {
        index,
        length: thumbSize,
        offset: thumbSize * index + thumbOffset * index,
      };
    },
    [images]
  );

  const handleManualScroll = () => {
    setAutoScrollActive(false);
  };

  return (
    <View style={styles.container}>
      {renderHeaderComponent ? (
        <View style={styles.header}>
          {renderHeaderComponent(images?.[activeIndex], activeIndex)}
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Zoom
          onZoomBegin={handleImagePreviewZoomBegin}
          isManualZoomEnabled={isManualZoomEnabled}
        >
          <Animated.FlatList
            data={images}
            initialScrollIndex={initialIndex}
            getItemLayout={getImageLayout}
            horizontal
            keyExtractor={keyExtractorImage}
            onMomentumScrollEnd={onMomentumEnd}
            pagingEnabled
            ref={topRef}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={handleManualScroll}
          />
        </Zoom>
      </View>
      {hideThumbs ? null : (
        <View>
          <FlatList
            initialScrollIndex={initialIndex}
            getItemLayout={getThumbLayout}
            contentContainerStyle={styles.thumbnailListContainer}
            data={props.images}
            horizontal
            keyExtractor={keyExtractorThumb}
            ref={bottomRef}
            renderItem={renderThumb}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ width: thumbOffset }} />
            )}
            onEndReachedThreshold={0.2}
            onEndReached={onEndReached}
            style={styles.bottomFlatlist}
            onScrollBeginDrag={handleManualScroll}
          />
        </View>
      )}
      {renderFooterComponent ? (
        <View style={styles.footer}>
          {renderFooterComponent(images[activeIndex], activeIndex)}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
  },
  footer: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  activeThumb: {
    borderWidth: 3,
  },
  thumb: {
    borderRadius: 12,
  },
  thumbnailListContainer: {
    paddingHorizontal: 10,
  },
  bottomFlatlist: {
    paddingVertical: 20,
  },
});

ImageGallery.defaultProps = defaultProps;

export default ImageGallery;
