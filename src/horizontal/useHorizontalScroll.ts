import { useCallback, useRef } from 'react';
import { Dimensions, FlatList } from 'react-native';
import { SharedValue, useAnimatedRef } from 'react-native-reanimated';
import { ImageObject } from '../types';

const { width: deviceWidth } = Dimensions.get('window');

export interface UseHorizontalScrollProps {
  activeIndex: number;
  thumbSize: number;
  thumbOffset: number;
  isScrolling: SharedValue<boolean>;
  goToIndex: (index: number) => void;
  onAutoScrollStop?: () => void;
}

export interface UseHorizontalScrollReturn {
  topRef: any;
  bottomRef: any;
  scrollToIndex: (index: number, scrollTopView?: boolean) => void;
  onMomentumEnd: (e: any) => void;
  handleManualScroll: () => void;
  onScrollEnd: () => void;
  getImageLayout: (data: any, index: number) => { index: number; length: number; offset: number };
  getThumbLayout: (data: any, index: number) => { index: number; length: number; offset: number };
}

export function useHorizontalScroll(props: UseHorizontalScrollProps): UseHorizontalScrollReturn {
  const {
    activeIndex,
    thumbSize,
    thumbOffset,
    isScrolling,
    goToIndex,
    onAutoScrollStop,
  } = props;

  const topRef = useAnimatedRef<FlatList<ImageObject>>();
  const bottomRef = useRef<FlatList>(null);

  const scrollToIndex = useCallback(
    (i: number, scrollTopView: boolean = false) => {
      const isValidIndex = Number.isFinite(i);

      if (!isValidIndex) {
        onAutoScrollStop?.();
        return;
      }

      if (isValidIndex && i !== activeIndex) {
        goToIndex(i);

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
    },
    [activeIndex, thumbSize, goToIndex, onAutoScrollStop]
  );

  const onMomentumEnd = useCallback(
    (e: any) => {
      const { x } = e.nativeEvent.contentOffset;
      const newIndex = Math.round(x / deviceWidth);
      if (newIndex !== activeIndex) {
        goToIndex(newIndex);
        // Sync thumb list
        if (bottomRef?.current) {
          if (newIndex * (thumbSize + 10) - thumbSize / 2 > deviceWidth / 2) {
            bottomRef?.current?.scrollToIndex({
              animated: true,
              index: newIndex,
            });
          } else {
            bottomRef?.current?.scrollToIndex({
              animated: true,
              index: 0,
            });
          }
        }
      }
    },
    [activeIndex, thumbSize, goToIndex]
  );

  const handleManualScroll = useCallback(() => {
    isScrolling.value = true;
    onAutoScrollStop?.();
  }, [isScrolling, onAutoScrollStop]);

  const onScrollEnd = useCallback(() => {
    isScrolling.value = false;
  }, [isScrolling]);

  const getImageLayout = useCallback(
    (_: any, index: number) => {
      return {
        index,
        length: deviceWidth,
        offset: deviceWidth * index,
      };
    },
    []
  );

  const getThumbLayout = useCallback(
    (_: any, index: number) => {
      return {
        index,
        length: thumbSize,
        offset: thumbSize * index + thumbOffset * index,
      };
    },
    [thumbSize, thumbOffset]
  );

  return {
    topRef,
    bottomRef,
    scrollToIndex,
    onMomentumEnd,
    handleManualScroll,
    onScrollEnd,
    getImageLayout,
    getThumbLayout,
  };
}
