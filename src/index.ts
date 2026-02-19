// Main component (wrapper)
export { default as ImageGallery } from './ImageGallery';

// Mode-specific components
export { HorizontalGallery, useHorizontalScroll } from './horizontal';
export { VerticalFeed, useVerticalScroll } from './vertical';

// Core components and hooks
export {
  useGalleryState,
  useZoomGesture,
  ZoomContainer,
  ImagePreview,
  Thumbnail,
} from './core';

// Types
export type {
  GalleryMode,
  ImageObject,
  ImageSource,
  BaseGalleryProps,
  HorizontalGalleryProps,
  VerticalFeedProps,
  ImageGalleryProps,
  ImagePreviewProps,
  ThumbnailProps,
  HeaderProps,
  FooterProps,
  RenderImageProps,
  GalleryState,
  IProps,
} from './types';

// Core types
export type {
  UseGalleryStateProps,
  UseGalleryStateReturn,
  UseZoomGestureProps,
  UseZoomGestureReturn,
  ZoomContainerProps,
} from './core';

// Horizontal types
export type {
  UseHorizontalScrollProps,
  UseHorizontalScrollReturn,
} from './horizontal';

// Vertical types
export type {
  UseVerticalScrollProps,
  UseVerticalScrollReturn,
} from './vertical';
