import { useCallback, useMemo, useRef } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import { GestureStateManagerType } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gestureStateManager';

export interface UseZoomGestureProps {
  animationFunction?: (toValue: number, config?: object) => any;
  animationConfig?: object;
  onZoomBegin?: () => void;
}

export interface UseZoomGestureReturn {
  zoomGesture: ReturnType<typeof Gesture.Exclusive>;
  contentContainerAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  onLayout: (event: LayoutChangeEvent) => void;
  onLayoutContent: (event: LayoutChangeEvent) => void;
  zoomOut: () => void;
  zoomIn: () => void;
  currentIconId: SharedValue<number>;
  lastScale: SharedValue<number>;
  handleZoom: () => void;
  isDragging: SharedValue<boolean>;
}

export function useZoomGesture(props: UseZoomGestureProps = {}): UseZoomGestureReturn {
  const {
    animationFunction = withTiming,
    animationConfig,
    onZoomBegin,
  } = props;

  const baseScale = useSharedValue(1);
  const pinchScale = useSharedValue(1);
  const lastScale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const isZoomedIn = useDerivedValue(() => {
    const isZoomed = lastScale.value > 1;

    if (isZoomed && onZoomBegin) {
      runOnJS(onZoomBegin)();
    }

    return isZoomed;
  });

  const currentIconId = useDerivedValue(() => {
    return lastScale.value >= 2.5 ? 2 : 1;
  });

  const zoomGestureLastTime = useSharedValue(0);
  const containerDimensions = useSharedValue({ width: 0, height: 0 });
  const contentDimensions = useSharedValue({ width: 1, height: 1 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const panStartOffsetX = useSharedValue(0);
  const panStartOffsetY = useSharedValue(0);

  const handlePanOutsideTimeoutId: React.MutableRefObject<
    ReturnType<typeof setTimeout> | undefined
  > = useRef();

  const withAnimation = useCallback(
    (toValue: number, config?: object) => {
      'worklet';

      return animationFunction(toValue, {
        duration: 350,
        ...config,
        ...animationConfig,
      });
    },
    [animationFunction, animationConfig]
  );

  const getContentContainerSize = useCallback(() => {
    return {
      width: containerDimensions.value.width,
      height:
        (contentDimensions.value.height * containerDimensions.value.width) /
        contentDimensions.value.width,
    };
  }, [containerDimensions]);

  const zoomIn = useCallback((): void => {
    let newScale = 2.5;

    lastScale.value = newScale;

    baseScale.value = withAnimation(newScale);
    pinchScale.value = withAnimation(1);
  }, [
    baseScale,
    pinchScale,
    lastScale,
    withAnimation,
  ]);

  const zoomOut = useCallback((): void => {
    const newScale = 1;
    lastScale.value = newScale;

    baseScale.value = withAnimation(newScale);
    pinchScale.value = withAnimation(1);

    const newOffsetX = 0;
    lastOffsetX.value = newOffsetX;

    const newOffsetY = 0;
    lastOffsetY.value = newOffsetY;

    translateX.value = withAnimation(newOffsetX);
    translateY.value = withAnimation(newOffsetY);
  }, [
    baseScale,
    pinchScale,
    lastOffsetX,
    lastOffsetY,
    translateX,
    translateY,
    lastScale,
    withAnimation,
  ]);

  const handlePanOutside = useCallback((): void => {
    if (handlePanOutsideTimeoutId.current !== undefined)
      clearTimeout(handlePanOutsideTimeoutId.current);

    handlePanOutsideTimeoutId.current = setTimeout((): void => {
      const { width, height } = getContentContainerSize();
      const maxOffset = {
        x:
          width * lastScale.value < containerDimensions.value.width
            ? 0
            : (width * lastScale.value - containerDimensions.value.width) /
              2 /
              lastScale.value,
        y:
          height * lastScale.value < containerDimensions.value.height
            ? 0
            : (height * lastScale.value - containerDimensions.value.height) /
              2 /
              lastScale.value,
      };

      const isPanedXOutside =
        lastOffsetX.value > maxOffset.x || lastOffsetX.value < -maxOffset.x;
      if (isPanedXOutside) {
        const newOffsetX = lastOffsetX.value >= 0 ? maxOffset.x : -maxOffset.x;
        lastOffsetX.value = newOffsetX;

        translateX.value = withAnimation(newOffsetX);
      } else {
        translateX.value = lastOffsetX.value;
      }

      const isPanedYOutside =
        lastOffsetY.value > maxOffset.y || lastOffsetY.value < -maxOffset.y;
      if (isPanedYOutside) {
        const newOffsetY = lastOffsetY.value >= 0 ? maxOffset.y : -maxOffset.y;
        lastOffsetY.value = newOffsetY;

        translateY.value = withAnimation(newOffsetY);
      } else {
        translateY.value = lastOffsetY.value;
      }
    }, 10);
  }, [
    lastOffsetX,
    lastOffsetY,
    lastScale,
    translateX,
    translateY,
    containerDimensions,
    getContentContainerSize,
    withAnimation,
  ]);

  const handleZoom = useCallback(() => {
    if (lastScale.value >= 2.5) {
      zoomOut();
    } else {
      zoomIn();
    }
  }, [zoomIn, zoomOut]);

  const onLayout = useCallback(
    ({
      nativeEvent: {
        layout: { width, height },
      },
    }: LayoutChangeEvent): void => {
      containerDimensions.value = {
        width,
        height,
      };
    },
    [containerDimensions]
  );

  const onLayoutContent = useCallback(
    ({
      nativeEvent: {
        layout: { width, height },
      },
    }: LayoutChangeEvent): void => {
      contentDimensions.value = {
        width,
        height,
      };
    },
    [contentDimensions]
  );

  const onPinchEnd = useCallback(
    (scale: number): void => {
      const newScale = lastScale.value * scale;
      lastScale.value = newScale;
      if (newScale > 1) {
        baseScale.value = newScale;
        pinchScale.value = 1;

        handlePanOutside();
      } else {
        zoomOut();
      }
    },
    [lastScale, baseScale, pinchScale, handlePanOutside, zoomOut]
  );

  const updateZoomGestureLastTime = useCallback((): void => {
    'worklet';

    zoomGestureLastTime.value = Date.now();
  }, [zoomGestureLastTime]);

  const zoomGesture = useMemo(() => {
    const tapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onStart(() => {
        updateZoomGestureLastTime();
      })
      .onEnd(() => {
        updateZoomGestureLastTime();
        runOnJS(handleZoom)();
      });

    const panGesture = Gesture.Pan()
      .onStart(
        (event: GestureUpdateEvent<PanGestureHandlerEventPayload>): void => {
          updateZoomGestureLastTime();

          const { translationX, translationY } = event;

          panStartOffsetX.value = translationX;
          panStartOffsetY.value = translationY;

          isDragging.value = true;
        }
      )
      .onUpdate(
        (event: GestureUpdateEvent<PanGestureHandlerEventPayload>): void => {
          updateZoomGestureLastTime();

          let { translationX, translationY } = event;

          translationX -= panStartOffsetX.value;
          translationY -= panStartOffsetY.value;

          translateX.value = lastOffsetX.value + translationX / lastScale.value;
          translateY.value = lastOffsetY.value + translationY / lastScale.value;
        }
      )
      .onEnd(
        (
          event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
        ): void => {
          updateZoomGestureLastTime();

          let { translationX, translationY } = event;

          translationX -= panStartOffsetX.value;
          translationY -= panStartOffsetY.value;

          // SAVES LAST POSITION
          lastOffsetX.value =
            lastOffsetX.value + translationX / lastScale.value;
          lastOffsetY.value =
            lastOffsetY.value + translationY / lastScale.value;

          isDragging.value = false;

          runOnJS(handlePanOutside)();
        }
      )
      .onTouchesMove(
        (e: GestureTouchEvent, state: GestureStateManagerType): void => {
          if (e.state === State.UNDETERMINED || e.state === State.BEGAN)
            if (isZoomedIn.value || e.numberOfTouches === 2) state.activate();
            else state.fail();
        }
      )
      .minDistance(0)
      .minPointers(2)
      .maxPointers(2);

    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        updateZoomGestureLastTime();
        isDragging.value = true;
      })
      .onUpdate(
        ({
          scale,
        }: GestureUpdateEvent<PinchGestureHandlerEventPayload>): void => {
          updateZoomGestureLastTime();

          pinchScale.value = scale;
        }
      )
      .onEnd(
        ({
          scale,
        }: GestureUpdateEvent<PinchGestureHandlerEventPayload>): void => {
          updateZoomGestureLastTime();

          pinchScale.value = scale;
          isDragging.value = false;

          runOnJS(onPinchEnd)(scale);
        }
      );

    return Gesture.Exclusive(
      Gesture.Simultaneous(pinchGesture, panGesture),
      tapGesture
    );
  }, [
    handlePanOutside,
    lastOffsetX,
    lastOffsetY,
    handleZoom,
    onPinchEnd,
    pinchScale,
    translateX,
    translateY,
    lastScale,
    isZoomedIn,
    updateZoomGestureLastTime,
    panStartOffsetX,
    panStartOffsetY,
    isDragging,
  ]);

  const contentContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: baseScale.value * pinchScale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return {
    zoomGesture,
    contentContainerAnimatedStyle,
    onLayout,
    onLayoutContent,
    lastScale,
    handleZoom,
    currentIconId,
    isDragging,
    zoomIn,
    zoomOut,
  };
}
