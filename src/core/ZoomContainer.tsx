import React, { PropsWithChildren } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  AnimatableValue,
  AnimationCallback,
  DerivedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useZoomGesture } from './useZoomGesture';

const iconsButton = {
  1: require('../assets/zoomIn.png'),
  2: require('../assets/zoomOut.png'),
};

export interface ZoomContainerProps {
  style?: StyleProp<ViewProps>;
  contentContainerStyle?: StyleProp<ViewProps>;
  animationConfig?: object;
  onZoomBegin?: () => void;
  isManualZoomEnabled: DerivedValue<boolean>;

  animationFunction?<T extends AnimatableValue>(
    toValue: T,
    userConfig?: object,
    callback?: AnimationCallback
  ): T;
}

export default function ZoomContainer(
  props: PropsWithChildren<ZoomContainerProps>
): React.ReactElement {
  const {
    isManualZoomEnabled,
    style,
    contentContainerStyle,
    children,
    ...rest
  } = props;

  const {
    zoomGesture,
    onLayout,
    onLayoutContent,
    contentContainerAnimatedStyle,
    lastScale,
    handleZoom,
    currentIconId,
    isDragging,
  } = useZoomGesture({
    ...rest,
  });

  const getIconOpacityStyle = (id: string) => {
    return useAnimatedStyle(() => ({
      opacity: id.toString() === currentIconId.value.toString() ? 1 : 0,
    }));
  };

  const manualZoomButtonAnimatedStyle = useAnimatedStyle(() => {
    const hideButton = isDragging.value || !isManualZoomEnabled.value;
    return {
      opacity: withDelay(hideButton ? 0 : 1000, withTiming(hideButton ? 0 : 1)),
    };
  });

  const childrenAnimatedProps = useAnimatedProps(() => {
    return {
      scrollEnabled: lastScale.value <= 1.2,
    };
  });

  return (
    <>
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
            {React.cloneElement(children as React.ReactElement, {
              animatedProps: childrenAnimatedProps,
            })}
          </Animated.View>
        </View>
      </GestureDetector>
      <Animated.View style={[styles.zoomButtonWrapper, manualZoomButtonAnimatedStyle]}>
        <TouchableOpacity
          key="zoom-button"
          onPress={handleZoom}
          style={[styles.zoomButtonContainer]}
        >
          {Object.entries(iconsButton).map(icon => (
            <Animated.Image
              key={icon[0]}
              source={icon[1]}
              style={[styles.zoomButtonImage, getIconOpacityStyle(icon[0])]}
            />
          ))}
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  zoomButtonWrapper: {
    position: 'absolute',
    right: 40,
    bottom: 40,
  },
  zoomButtonContainer: {
    backgroundColor: '#2E2B2B',
    overflow: 'hidden',
    borderRadius: 50,
    padding: 8,
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
