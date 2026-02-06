import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { GlassView } from './GlassView';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { useCallback } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}: GlassButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(0.8, { duration: 100 });
    }
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 100 });
    }
  }, [disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return isDark ? 'rgba(10, 126, 164, 0.3)' : 'rgba(10, 126, 164, 0.2)';
      case 'secondary':
        return isDark ? 'rgba(120, 120, 120, 0.3)' : 'rgba(200, 200, 200, 0.3)';
      case 'danger':
        return isDark ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 59, 48, 0.2)';
      default:
        return isDark ? 'rgba(120, 120, 120, 0.3)' : 'rgba(200, 200, 200, 0.3)';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return isDark ? '#64D2FF' : '#0a7ea4';
      case 'secondary':
        return isDark ? '#FFFFFF' : '#11181C';
      case 'danger':
        return '#FF453A';
      default:
        return isDark ? '#FFFFFF' : '#11181C';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle, style]}
      disabled={disabled}
      activeOpacity={1}
    >
      <GlassView
        intensity={variant === 'primary' ? 70 : 50}
        borderRadius={12}
        style={[styles.glass, getSizeStyles(), { backgroundColor: getBackgroundColor() }]}
      >
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {icon && <>{icon} </>}
          {title}
        </Text>
      </GlassView>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  glass: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
