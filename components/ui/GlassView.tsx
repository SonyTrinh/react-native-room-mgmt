import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export function GlassView({ 
  children, 
  style, 
  intensity = 50, 
  tint,
  borderRadius = 16,
  ...props 
}: GlassViewProps) {
  const colorScheme = useColorScheme();
  const effectiveTint = tint || (colorScheme === 'dark' ? 'dark' : 'light');

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={effectiveTint}
        style={[styles.container, { borderRadius }, style]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  // Fallback for Android and web
  return (
    <View 
      style={[
        styles.container, 
        { borderRadius }, 
        colorScheme === 'dark' ? styles.darkFallback : styles.lightFallback,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  lightFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  darkFallback: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
