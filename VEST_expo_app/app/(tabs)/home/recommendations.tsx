import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { GlassCard } from '@/components/GlassCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { FontSizes } from '@/constants/theme';

const recommendations = [
  {
    id: 1,
    title: 'Monitor Heart Rate',
    description: 'Keep tracking for the next 30 minutes. If rate stays above 120 BPM at rest, consult your vet.',
    icon: 'heart' as const,
    color: '#F43F5E',
  },
  {
    id: 2,
    title: 'Ensure Hydration',
    description: 'Provide fresh water and a cool resting area. Dehydration can elevate vitals.',
    icon: 'water' as const,
    color: '#3B82F6',
  },
  {
    id: 3,
    title: 'Reduce Activity',
    description: 'Limit physical activity until vitals return to baseline levels.',
    icon: 'pause-circle' as const,
    color: '#F59E0B',
  },
];

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Recommendations</Text>
          <View style={{ width: 36 }} />
        </View>

        {recommendations.map((rec) => (
          <GlassCard key={rec.id}>
            <View style={styles.recRow}>
              <View style={[styles.recIcon, { backgroundColor: `${rec.color}20` }]}>
                <Ionicons name={rec.icon} size={20} color={rec.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recTitle, { color: colors.foreground }]}>{rec.title}</Text>
                <Text style={[styles.recDesc, { color: colors.mutedForeground }]}>{rec.description}</Text>
              </View>
            </View>
          </GlassCard>
        ))}

        <Pressable
          onPress={() => router.push('/(tabs)/home/share-vet')}
          style={[styles.shareBtn, { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' }]}
        >
          <Ionicons name="share-outline" size={18} color={colors.blue500} />
          <Text style={[styles.shareBtnText, { color: colors.blue500 }]}>Share Report with Vet</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSizes.title2, fontWeight: '700', letterSpacing: -0.5 },
  recRow: { flexDirection: 'row', gap: 14 },
  recIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  recTitle: { fontSize: FontSizes.body, fontWeight: '600', marginBottom: 4 },
  recDesc: { fontSize: FontSizes.subhead, lineHeight: 20 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  shareBtnText: { fontSize: FontSizes.subhead, fontWeight: '600' },
});
