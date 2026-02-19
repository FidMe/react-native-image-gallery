import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useDerivedValue} from 'react-native-reanimated';
import {VerticalFeedProps, ImageObject, RenderImageProps} from '../types';
import {useGalleryState, ZoomContainer, ImagePreview} from '../core';
import {useVerticalScroll} from './useVerticalScroll';


const VerticalFeed = ({
                        images,
                        initialIndex,
                        renderCustomImage,
                        renderFooterComponent,
                        renderHeaderComponent,
                        resizeMode = 'contain',
                        onPressImage,
                        onPageChange,
                        onEndReached,
                        onEndReachedThreshold = 0.5,
                        enableZoom = false,
                        contentContainerStyle,
                      }: VerticalFeedProps) => {


  const {
    activeIndex,
    activeIndexRef,
    goToIndex,
    isScrolling,
    currentImage,
  } = useGalleryState({
    images,
    initialIndex,
    onPageChange,
  });

  const isManualZoomEnabled = useDerivedValue(
    () => enableZoom && !isScrolling.value,
    [enableZoom]
  );

  const {
    listRef,
    viewabilityConfig,
    onViewableItemsChanged,
    handleManualScroll,
    onScrollEnd,
  } = useVerticalScroll({
    isScrolling,
    goToIndex,
    activeIndexRef,
  });

  const keyExtractor = useCallback(
    (item: ImageObject, index: number) =>
      item && item.id ? item.id.toString() : index.toString(),
    []
  );

  const handlePressPreview = useCallback(
    (item: ImageObject) => {
      onPressImage?.(item);
    },
    [onPressImage]
  );

  const handleZoomBegin = useCallback(() => {
    // Optional: handle zoom begin in vertical mode
  }, []);

  const renderItem = useCallback(
    ({item, index}: RenderImageProps) => {
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

  return (
    <View style={styles.container}>
      {/* Floating header for vertical mode */}
      {renderHeaderComponent ? (
        <View style={styles.floatingHeader}>
          {renderHeaderComponent(currentImage!, activeIndex)}
        </View>
      ) : null}

      <View style={styles.content}>
        <ZoomContainer
          onZoomBegin={handleZoomBegin}
          isManualZoomEnabled={isManualZoomEnabled}
        >
          <Animated.FlatList
            ref={listRef}
            data={images}
            initialScrollIndex={initialIndex}
            horizontal={false}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollBeginDrag={handleManualScroll}
            onScrollEndDrag={onScrollEnd}
          />
        </ZoomContainer>
      </View>

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
  floatingHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
  },
  contentContainer: {
    paddingTop: 60,
  },
  footer: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
});

export default VerticalFeed;
