import React from 'react';
import {ImageResizeMode, StyleProp, ViewStyle} from 'react-native';

// Gallery mode
export type GalleryMode = 'horizontal' | 'vertical';

// Image source type
export interface ImageSource {
  uri: string;
  headers?: { [key: string]: string };
}

// Image object
export interface ImageObject {
  id?: string | number;
  thumbnail?: {
    source: ImageSource;
  };
  source: ImageSource;
}

// Render props types
export interface RenderImageProps {
  item: ImageObject;
  index: number;
  resizeMode?: ImageResizeMode;
}

// Base gallery props shared between modes
export interface BaseGalleryProps {
  images: ImageObject[];
  initialIndex?: number;
  resizeMode?: ImageResizeMode;
  enableZoom?: boolean;
  onPageChange?: (index: number) => void;
  onPressImage?: (item: ImageObject) => void;

  onEndReached?: () => void;
  onEndReachedThreshold?: number;

  renderCustomImage?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;

  renderHeaderComponent?: (
    item: ImageObject,
    currentIndex: number
  ) => React.ReactNode;

  renderFooterComponent?: (
    item: ImageObject,
    currentIndex: number
  ) => React.ReactNode;
}

// Props specific to horizontal gallery mode
export interface HorizontalGalleryProps extends BaseGalleryProps {
  // Thumbnails
  hideThumbs?: boolean;
  thumbColor?: string;
  thumbSize?: number;
  thumbOffset?: number;
  thumbResizeMode?: ImageResizeMode;
  renderCustomThumb?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;

  // Swipe & Auto-scroll
  disableSwipe?: boolean;
  autoScroll?: number;
  disableAutoScroll?: boolean;

  // Close action
  close?: () => void;
}

// Props specific to vertical feed mode
export interface VerticalFeedProps extends BaseGalleryProps {
  contentContainerStyle?: StyleProp<ViewStyle>;
}

// Main wrapper props (union of both modes with mode selector)
export interface ImageGalleryProps extends BaseGalleryProps {
  mode?: GalleryMode;

  // Horizontal-specific (only used when mode='horizontal')
  hideThumbs?: boolean;
  thumbColor?: string;
  thumbSize?: number;
  thumbOffset?: number;
  thumbResizeMode?: ImageResizeMode;
  renderCustomThumb?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;
  disableSwipe?: boolean;
  autoScroll?: number;
  disableAutoScroll?: boolean;
  close?: () => void;

  // Vertical-specific (only used when mode='vertical')
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;

  // Deprecated: use 'mode' instead
  /** @deprecated Use mode='horizontal' or mode='vertical' instead */
  horizontal?: boolean;

  // Legacy props (kept for backwards compatibility)
  /** @deprecated Use enableZoom instead */
  enableManualZoom?: boolean;
  /** @deprecated Use onPressImage instead */
  onPressPreviewImage?: (item: ImageObject) => void;
}

// Header component props
export interface HeaderProps {
  currentIndex: number;
  item?: ImageObject;
}

// Footer component props
export interface FooterProps {
  currentIndex: number;
  total: number;
}

// Image preview component props
export interface ImagePreviewProps {
  index: number;
  isSelected: boolean;
  item: ImageObject;
  resizeMode?: ImageResizeMode;
  onPress?: (item: ImageObject) => void;

  renderCustomImage?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;
}

// Thumbnail component props
export interface ThumbnailProps {
  item: ImageObject;
  index: number;
  isSelected: boolean;
  thumbSize: number;
  thumbColor: string;
  thumbResizeMode: ImageResizeMode;
  onPress: (index: number) => void;
  renderCustomThumb?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;
}

// Gallery state hook return type
export interface GalleryState {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  goToIndex: (index: number, options?: { animated?: boolean }) => void;
  currentImage: ImageObject | undefined;
}

// Legacy IProps for backwards compatibility
/** @deprecated Use ImageGalleryProps instead */
export interface IProps {
  close?: () => void;
  hideThumbs?: boolean;
  images: ImageObject[];
  initialIndex?: number;
  resizeMode?: ImageResizeMode;
  thumbColor?: string;
  thumbSize?: number;
  thumbResizeMode?: ImageResizeMode;
  thumbOffset?: number;
  disableSwipe?: boolean;
  onEndReached?: () => void;
  onPressPreviewImage?: (item: ImageObject) => void;
  onPageChange?: (index: number) => void;
  autoScroll?: number;
  disableAutoScroll?: boolean;
  enableManualZoom?: boolean;
  horizontal?: boolean;

  renderCustomThumb?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;

  renderCustomImage?: (
    item: ImageObject,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;

  renderHeaderComponent?: (
    item: ImageObject,
    currentIndex: number
  ) => React.ReactNode;

  renderFooterComponent?: (
    item: ImageObject,
    currentIndex: number
  ) => React.ReactNode;
}
