import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSizes } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function LaunchScreen() {
  const insets = useSafeAreaInsets();
  const iconScale = useSharedValue(0.5);
  const iconOpacity = useSharedValue(0);
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.3);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    iconOpacity.value = withTiming(1, { duration: 800 });

    const animate = () => {
      pingScale.value = 1;
      pingOpacity.value = 0.3;
      pingScale.value = withTiming(1.8, { duration: 1500 });
      pingOpacity.value = withDelay(200, withTiming(0, { duration: 1300 }));
    };
    animate();
    const interval = setInterval(animate, 2000);
    return () => clearInterval(interval);
  }, []);

  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const pingAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['rgba(234,179,8,0.15)', '#0F172A', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.pingCircle, pingAnim]} />
          <Animated.View style={[styles.iconCircle, iconAnim]}>
            <Ionicons name="paw" size={48} color="#0F172A" />
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(400).duration(600)}>
          <Text style={styles.title}>VEST</Text>
          <Text style={styles.subtitle}>Vital Monitoring for Your Best Friend</Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(1000).duration(500)}
        style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}
      >
        <Pressable
          onPress={() => router.push('/(auth)/sign-in')}
          style={({ pressed }) => [
            styles.button,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pingCircle: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FACC15',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FACC15',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: FontSizes.largeTitle,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.subhead,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: '#0F172A',
  },
});
