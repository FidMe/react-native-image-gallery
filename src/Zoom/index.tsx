import React, { PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import Animated, {
  AnimatableValue,
  AnimationCallback,
  DerivedValue,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import { GestureStateManagerType } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gestureStateManager';

const iconsButton = {
  1: require('../assets/zoomIn.png'),
  2: require('../assets/zoomOut.png'),
};

interface UseZoomGestureProps {
  animationFunction?: (toValue: number, config?: object) => any;
  animationConfig?: object;
  onZoomBegin?: () => void;
}

export function useZoomGesture(props: UseZoomGestureProps = {}): {
  zoomGesture: typeof Gesture;
  contentContainerAnimatedStyle: any;
  onLayout: (event: LayoutChangeEvent) => void;
  onLayoutContent: (event: LayoutChangeEvent) => void;
  zoomOut: () => void;
  zoomIn: () => void;
  isZoomedIn: DerivedValue<boolean>;
  currentIconId: SharedValue<number>;
  zoomGestureLastTime: SharedValue<number>;
  lastScale: SharedValue<number>;
  handleZoom: () => void;
} {
  const {
    animationFunction = withTiming,
    animationConfig,
    onZoomBegin,
  } = props;

  const baseScale = useSharedValue(1);
  const pinchScale = useSharedValue(1);
  const lastScale = useSharedValue(1);
  const isZoomedIn = useDerivedValue(() => {
    if (lastScale.value > 1 && onZoomBegin) {
      runOnJS(onZoomBegin)();
    }

    return lastScale.value > 1;
  });

  const currentIconId = useDerivedValue(() => {
    return lastScale.value > 2.5 ? 2 : 1;
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
    let newScale = lastScale.value * 1.6;

    lastScale.value = newScale;

    baseScale.value = withAnimation(newScale);
    pinchScale.value = withAnimation(1);
  }, [
    baseScale,
    pinchScale,
    lastOffsetX,
    lastOffsetY,
    translateX,
    translateY,
    lastScale,
    getContentContainerSize,
    isZoomedIn,
    currentIconId,
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

    // setZoomIcon(zoomInIcon);
  }, [
    baseScale,
    pinchScale,
    lastOffsetX,
    lastOffsetY,
    translateX,
    translateY,
    lastScale,
    isZoomedIn,
    currentIconId,
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

  const onDoubleTap = useCallback((): void => {
    if (lastScale.value >= 2.5) zoomOut();
    else zoomIn();
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
    [lastScale, baseScale, pinchScale, handlePanOutside, zoomOut, isZoomedIn]
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

        runOnJS(onDoubleTap)();
      });

    const panGesture = Gesture.Pan()
      .onStart(
        (event: GestureUpdateEvent<PanGestureHandlerEventPayload>): void => {
          updateZoomGestureLastTime();

          const { translationX, translationY } = event;

          panStartOffsetX.value = translationX;
          panStartOffsetY.value = translationY;
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

          runOnJS(handlePanOutside)();
        }
      )
      .onTouchesMove(
        (e: GestureTouchEvent, state: GestureStateManagerType): void => {
          if ([State.UNDETERMINED, State.BEGAN].includes(e.state))
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
    onDoubleTap,
    onPinchEnd,
    pinchScale,
    translateX,
    translateY,
    lastScale,
    isZoomedIn,
  ]);

  const contentContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: baseScale.value * pinchScale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleZoom = useCallback(() => {
    if (lastScale.value >= 2.5) {
      zoomOut();
    } else {
      zoomIn();
    }
  }, [zoomIn, zoomOut]);

  return {
    zoomGesture,
    contentContainerAnimatedStyle,
    onLayout,
    onLayoutContent,
    isZoomedIn,
    zoomGestureLastTime,
    lastScale,
    handleZoom,
    currentIconId,
  };
}

export default function Zoom(
  props: PropsWithChildren<ZoomProps>
): React.ReactElement {
  const { style, contentContainerStyle, children, ...rest } = props;

  const {
    zoomGesture,
    onLayout,
    onLayoutContent,
    contentContainerAnimatedStyle,
    lastScale,
    handleZoom,
    currentIconId,
  } = useZoomGesture({
    ...rest,
  });

  const getIconOpacityStyle = (id: string) => {
    return useAnimatedStyle(() => ({
      //change opacity in UI thread.
      opacity: id.toString() === currentIconId.value.toString() ? 1 : 0,
    }));
  };

  const childrenAnimatedProps = useAnimatedProps(() => {
    return {
      scrollEnabled: lastScale.value <= 1.2,
    };
  });

  return (
    <GestureDetector gesture={zoomGesture}>
      <View
        style={[styles.container, style]}
        onLayout={onLayout}
        collapsable={false}
      >
        <Animated.View
          style={[contentContainerAnimatedStyle, contentContainerStyle]}
          onLayout={onLayoutContent}
        >
          {React.cloneElement(children, {
            animatedProps: childrenAnimatedProps,
          })}
        </Animated.View>
        <TouchableOpacity
          onPress={handleZoom}
          style={styles.zoomButtonContainer}
        >
          {Object.entries(iconsButton).map(icon => (
            <Animated.Image
              source={icon[1]}
              style={[styles.zoomButtonImage, getIconOpacityStyle(icon[0])]}
            />
          ))}
        </TouchableOpacity>
      </View>
    </GestureDetector>
  );
}

export interface ZoomProps {
  style?: StyleProp<ViewProps>;
  contentContainerStyle?: StyleProp<ViewProps>;
  animationConfig?: object;
  onZoomBegin?: () => void;

  animationFunction?<T extends AnimatableValue>(
    toValue: T,
    userConfig?: object,
    callback?: AnimationCallback
  ): T;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  zoomButtonContainer: {
    backgroundColor: '#ff5722',
    overflow: 'hidden',
    borderRadius: 50,
    position: 'absolute',
    padding: 8,
    right: 45,
    bottom: 45,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
    position: 'absolute',
  },
});
