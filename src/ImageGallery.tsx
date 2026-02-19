import React from 'react';
import {ImageGalleryProps, HorizontalGalleryProps, VerticalFeedProps} from './types';
import {HorizontalGallery} from './horizontal';
import {VerticalFeed} from './vertical';

const ImageGallery = ({
                        mode,
                        horizontal,
                        // Legacy prop mapping
                        enableManualZoom,
                        onPressPreviewImage,
                        // Base props
                        images,
                        initialIndex,
                        resizeMode,
                        onPageChange,
                        renderCustomImage,
                        renderHeaderComponent,
                        renderFooterComponent,
                        onEndReached,
                        onEndReachedThreshold,
                        // Horizontal-specific props
                        hideThumbs,
                        thumbColor,
                        thumbSize,
                        thumbOffset,
                        thumbResizeMode,
                        renderCustomThumb,
                        disableSwipe,
                        autoScroll,
                        disableAutoScroll,
                        close,
                        // Vertical-specific props
                        ListHeaderComponent,
                        contentContainerStyle,
                        // New props
                        enableZoom,
                        onPressImage,
                      }: ImageGalleryProps) => {


  // Determine effective mode: new 'mode' prop takes precedence over deprecated 'horizontal'
  const effectiveMode = mode ?? (horizontal === false ? 'vertical' : 'horizontal');

  // Map legacy props to new props
  const effectiveEnableZoom = enableZoom ?? enableManualZoom;
  const effectiveOnPressImage = onPressImage ?? onPressPreviewImage;

  if (effectiveMode === 'vertical') {
    const verticalProps: VerticalFeedProps = {
      images,
      initialIndex,
      resizeMode,
      enableZoom: effectiveEnableZoom,
      onPageChange,
      onPressImage: effectiveOnPressImage,
      renderCustomImage,
      renderHeaderComponent,
      renderFooterComponent,
      onEndReached,
      onEndReachedThreshold,
      ListHeaderComponent,
      contentContainerStyle,
    };

    return <VerticalFeed {...verticalProps} />;
  }

  const horizontalProps: HorizontalGalleryProps = {
    images,
    initialIndex,
    resizeMode,
    enableZoom: effectiveEnableZoom,
    onPageChange,
    onPressImage: effectiveOnPressImage,
    renderCustomImage,
    renderHeaderComponent,
    renderFooterComponent,
    hideThumbs,
    thumbColor,
    thumbSize,
    thumbOffset,
    thumbResizeMode,
    renderCustomThumb,
    disableSwipe,
    autoScroll,
    disableAutoScroll,
    close,
    onEndReached,
    onEndReachedThreshold,
  };

  return <HorizontalGallery {...horizontalProps} />;
};

export default ImageGallery;
