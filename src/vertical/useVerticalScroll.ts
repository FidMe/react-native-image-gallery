import { useCallback, useRef } from 'react';
import { FlatList, ViewToken } from 'react-native';
import { SharedValue, useAnimatedRef } from 'react-native-reanimated';
import { ImageObject } from '../types';

const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

export interface UseVerticalScrollProps {
  isScrolling: SharedValue<boolean>;
  goToIndex: (index: number) => void;
  activeIndexRef: React.MutableRefObject<number>;
}

export interface UseVerticalScrollReturn {
  listRef: any;
  viewabilityConfig: typeof viewabilityConfig;
  onViewableItemsChanged: (info: { viewableItems: ViewToken[] }) => void;
  handleManualScroll: () => void;
  onScrollEnd: () => void;
}

export function useVerticalScroll(props: UseVerticalScrollProps): UseVerticalScrollReturn {
  const {
    isScrolling,
    goToIndex,
    activeIndexRef,
  } = props;

  const listRef = useAnimatedRef<FlatList<ImageObject>>();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems.length) return;

      const minIndex = viewableItems
        .map(v => v.index)
        .filter((i): i is number => i != null)
        .reduce((min, i) => Math.min(min, i), Number.POSITIVE_INFINITY);

      if (!Number.isFinite(minIndex)) return;

      if (minIndex !== activeIndexRef.current) {
        goToIndex(minIndex);
      }
    }
  ).current;

  const handleManualScroll = useCallback(() => {
    isScrolling.value = true;
  }, [isScrolling]);

  const onScrollEnd = useCallback(() => {
    isScrolling.value = false;
  }, [isScrolling]);

  return {
    listRef,
    viewabilityConfig,
    onViewableItemsChanged,
    handleManualScroll,
    onScrollEnd,
  };
}
