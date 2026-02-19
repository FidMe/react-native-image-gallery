import React from 'react';
import { ImageGalleryProps, HorizontalGalleryProps, VerticalFeedProps } from './types';
import { HorizontalGallery } from './horizontal';
import { VerticalFeed } from './vertical';

const ImageGallery = (props: ImageGalleryProps) => {
  const {
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
    onEndReached,
    onEndReachedThreshold,
    ListHeaderComponent,
    contentContainerStyle,
    // New props
    enableZoom,
    onPressImage,
  } = props;

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
  };

  return <HorizontalGallery {...horizontalProps} />;
};

export default ImageGallery;
