import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes, Spacing, BorderRadius } from '@/constants/theme';
import { DOG_PROFILES } from '@/constants/dog-profiles';
import { useDogProfile } from '@/hooks/use-dog-profile';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { selectedProfile, setSelectedProfile } = useDogProfile();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Select Profile</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choose the dog you want to monitor
          </Text>
        </Animated.View>

        <View style={styles.profileList}>
          {DOG_PROFILES.map((dog, i) => (
            <Animated.View
              key={dog.id}
              entering={FadeInLeft.delay(i * 100).duration(400)}
            >
              <Pressable
                onPress={() => {
                  setSelectedProfile(dog);
                  router.replace('/(tabs)/home');
                }}
                style={({ pressed }) => pressed && { transform: [{ scale: 0.97 }] }}
              >
                <GlassCard
                  style={[
                    styles.profileCard,
                    selectedProfile.id === dog.id && {
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <View style={styles.profileRow}>
                    <Image
                      source={{ uri: dog.image }}
                      style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={[styles.profileName, { color: colors.foreground }]}>
                        {dog.name}
                      </Text>
                      <Text style={[styles.profileBreed, { color: colors.mutedForeground }]}>
                        {dog.breed} · {dog.age}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                  </View>
                </GlassCard>
              </Pressable>
            </Animated.View>
          ))}

          <Animated.View entering={FadeIn.delay(400).duration(400)}>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Work in Progress',
                  'Add New Profile is not available yet. This feature is coming soon.'
                )
              }
              style={[styles.addButton, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]}
            >
              <Ionicons name="add" size={22} color={colors.mutedForeground} />
              <Text style={[styles.addText, { color: colors.mutedForeground }]}>
                Add New Profile (Work in Progress)
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        <Text style={[styles.version, { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }]}>
          v1.0.2 – Connected to Cloud
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: FontSizes.title1,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.subhead,
    marginTop: 8,
  },
  profileList: {
    gap: 16,
  },
  profileCard: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.title3,
    fontWeight: '700',
  },
  profileBreed: {
    fontSize: FontSizes.subhead,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addText: {
    fontSize: FontSizes.subhead,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: FontSizes.caption,
    marginTop: 32,
  },
});
