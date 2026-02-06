import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { GlassView } from './GlassView';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { useCallback } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlassCard({
  children,
  onPress,
  style,
  intensity = 60,
  borderRadius = 20,
  disabled = false,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (onPress && !disabled) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle, style]}
        activeOpacity={1}
      >
        <GlassView intensity={intensity} borderRadius={borderRadius} style={styles.glass}>
          {children}
        </GlassView>
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      <GlassView intensity={intensity} borderRadius={borderRadius} style={styles.glass}>
        {children}
      </GlassView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  glass: {
    flex: 1,
  },
});
