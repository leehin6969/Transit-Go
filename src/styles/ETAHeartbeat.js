import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const ETAHeartbeat = ({ isUpdating, children }) => {
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isUpdating) {
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isUpdating]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        backgroundColor: '#e8f2ff',
        borderRadius: 4,
        padding: 4,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default ETAHeartbeat;