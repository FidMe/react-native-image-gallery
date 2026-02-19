import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { HorizontalGalleryProps, ImageObject, RenderImageProps } from '../types';
import { useGalleryState, ZoomContainer, ImagePreview, Thumbnail } from '../core';
import { useHorizontalScroll } from './useHorizontalScroll';

const HorizontalGallery = (props: HorizontalGalleryProps) => {
  const {
    hideThumbs = false,
    images,
    initialIndex,
    renderCustomImage,
    renderCustomThumb,
    renderFooterComponent,
    renderHeaderComponent,
    resizeMode = 'contain',
    thumbColor = '#d9b44a',
    thumbResizeMode = 'cover',
    thumbSize = 48,
    thumbOffset = 10,
    onPressImage,
    onPageChange,
    autoScroll = 0,
    disableAutoScroll = false,
    enableZoom = false,
  } = props;

  const [autoScrollActive, setAutoScrollActive] = useState(autoScroll > 0);

  const {
    activeIndex,
    goToIndex,
    isScrolling,
    currentImage,
  } = useGalleryState({
    images,
    initialIndex,
    onPageChange,
  });

  const isManualZoomEnabled = useDerivedValue(
    () => !autoScrollActive && enableZoom && !isScrolling.value,
    [autoScrollActive, enableZoom]
  );

  const handleAutoScrollStop = useCallback(() => {
    setAutoScrollActive(false);
  }, []);

  const {
    topRef,
    bottomRef,
    scrollToIndex,
    onMomentumEnd,
    handleManualScroll,
    onScrollEnd,
    getImageLayout,
    getThumbLayout,
  } = useHorizontalScroll({
    activeIndex,
    thumbSize,
    thumbOffset,
    isScrolling,
    goToIndex,
    onAutoScrollStop: handleAutoScrollStop,
  });

  const keyExtractor = useCallback(
    (item: ImageObject, index: number) =>
      item && item.id ? item.id.toString() : index.toString(),
    []
  );

  const handlePressPreview = useCallback(
    (item: ImageObject) => {
      setAutoScrollActive(false);
      onPressImage?.(item);
    },
    [onPressImage]
  );

  const handleZoomBegin = useCallback(() => {
    setAutoScrollActive(false);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: RenderImageProps) => {
      return (
        <ImagePreview
          index={index}
          isSelected={activeIndex === index}
          item={item}
          resizeMode={resizeMode}
          renderCustomImage={renderCustomImage}
          onPress={handlePressPreview}
        />
      );
    },
    [activeIndex, resizeMode, renderCustomImage, handlePressPreview]
  );

  const renderThumb = useCallback(
    ({ item, index }: RenderImageProps) => {
      return (
        <Thumbnail
          item={item}
          index={index}
          isSelected={activeIndex === index}
          thumbSize={thumbSize}
          thumbColor={thumbColor}
          thumbResizeMode={thumbResizeMode}
          onPress={(i) => scrollToIndex(i, true)}
          renderCustomThumb={renderCustomThumb}
        />
      );
    },
    [activeIndex, thumbSize, thumbColor, thumbResizeMode, renderCustomThumb, scrollToIndex]
  );

  // Auto-scroll effect
  useEffect(() => {
    let autoScrollTimer: ReturnType<typeof setInterval>;

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
  }, [activeIndex, autoScrollActive, disableAutoScroll, autoScroll, images.length, scrollToIndex]);

  return (
    <View style={styles.container}>
      {renderHeaderComponent ? (
        <View style={styles.header}>
          {renderHeaderComponent(currentImage!, activeIndex)}
        </View>
      ) : null}

      <View style={styles.content}>
        <ZoomContainer
          onZoomBegin={handleZoomBegin}
          isManualZoomEnabled={isManualZoomEnabled}
        >
          <Animated.FlatList
            ref={topRef}
            data={images}
            initialScrollIndex={initialIndex}
            horizontal
            keyExtractor={keyExtractor}
            onMomentumScrollEnd={onMomentumEnd}
            pagingEnabled
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={handleManualScroll}
            onScrollEndDrag={onScrollEnd}
            getItemLayout={getImageLayout}
            contentContainerStyle={{ alignItems: 'center' }}
          />
        </ZoomContainer>
      </View>

      {hideThumbs ? null : (
        <View>
          <FlatList
            initialScrollIndex={initialIndex}
            getItemLayout={getThumbLayout}
            contentContainerStyle={styles.thumbnailListContainer}
            data={images}
            horizontal
            keyExtractor={keyExtractor}
            ref={bottomRef}
            renderItem={renderThumb}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: thumbOffset }} />}
            onEndReachedThreshold={0.2}
            style={styles.bottomFlatlist}
            onScrollBeginDrag={handleManualScroll}
          />
        </View>
      )}

      {renderFooterComponent ? (
        <View style={styles.footer}>
          {renderFooterComponent(currentImage!, activeIndex)}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  thumbnailListContainer: {
    paddingHorizontal: 10,
  },
  bottomFlatlist: {
    paddingVertical: 20,
  },
});

export default HorizontalGallery;
