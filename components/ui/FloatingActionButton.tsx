import { StyleSheet, View } from 'react-native';
import { GlassView } from './GlassView';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { useCallback } from 'react';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
}

const AnimatedTouchable = Animated.createAnimatedComponent(View);

export function FloatingActionButton({
  onPress,
  icon = 'plus',
  size = 'medium',
  variant = 'primary',
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'large':
        return 72;
      default:
        return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const buttonSize = getSize();

  return (
    <AnimatedTouchable
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View onTouchEnd={onPress}>
        <GlassView
          intensity={variant === 'primary' ? 80 : 60}
          borderRadius={buttonSize / 2}
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              backgroundColor: variant === 'primary' 
                ? (isDark ? 'rgba(10, 126, 164, 0.4)' : 'rgba(10, 126, 164, 0.3)')
                : (isDark ? 'rgba(120, 120, 120, 0.4)' : 'rgba(200, 200, 200, 0.4)')
            }
          ]}
        >
          <IconSymbol 
            name={icon as any} 
            size={getIconSize()} 
            color={variant === 'primary' 
              ? (isDark ? '#64D2FF' : '#0a7ea4')
              : (isDark ? '#FFFFFF' : '#11181C')
            } 
          />
        </GlassView>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
