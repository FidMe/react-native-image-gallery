import { useState, useCallback, useRef, useEffect } from 'react';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { ImageObject } from '../types';

export interface UseGalleryStateProps {
  images: ImageObject[];
  initialIndex?: number;
  onPageChange?: (index: number) => void;
}

export interface UseGalleryStateReturn {
  activeIndex: number;
  activeIndexRef: React.MutableRefObject<number>;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  goToIndex: (index: number) => void;
  isScrolling: SharedValue<boolean>;
  currentImage: ImageObject | undefined;
}

export function useGalleryState(props: UseGalleryStateProps): UseGalleryStateReturn {
  const { images, initialIndex = 0, onPageChange } = props;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeIndexRef = useRef(initialIndex);
  const isScrolling = useSharedValue(false);

  // Sync activeIndexRef with activeIndex
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Initialize on mount
  useEffect(() => {
    if (initialIndex) {
      onPageChange?.(initialIndex);
      setActiveIndex(initialIndex);
    } else {
      onPageChange?.(0);
      setActiveIndex(0);
    }
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const isValidIndex = Number.isFinite(index) && index >= 0 && index < images.length;

      if (isValidIndex && index !== activeIndexRef.current) {
        activeIndexRef.current = index;
        setActiveIndex(index);
        onPageChange?.(index);
      }
    },
    [images.length, onPageChange]
  );

  return {
    activeIndex,
    activeIndexRef,
    setActiveIndex,
    goToIndex,
    isScrolling,
    currentImage: images[activeIndex],
  };
}
