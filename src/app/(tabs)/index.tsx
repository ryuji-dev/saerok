import { router } from 'expo-router';
import { Camera, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirdCard, type BirdCardData } from '@/components/bird-card';
import { Sparrow } from '@/components/illustrations/sparrow';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// 목업 데이터 — Supabase 연동 시 교체.
const REGION = '성동구';
const COLLECTED = 7;
const TOTAL = 30;

const RECENT: (BirdCardData & { id: string })[] = [
  { id: 'r1', name: '참새', rarityLabel: '흔함', collected: true, caption: '오늘' },
  { id: 'r2', name: '직박구리', rarityLabel: '흔함', collected: true, caption: '어제' },
  { id: 'r3', name: '박새', rarityLabel: '흔함', collected: true, caption: '3일 전' },
  { id: 'r4', name: '멧비둘기', rarityLabel: '흔함', collected: true, caption: '5일 전' },
];

const SEASON: (BirdCardData & { id: string })[] = [
  { id: 's1', name: '청둥오리', rarityLabel: '시즌', collected: false },
  { id: 's2', name: '쇠오리', rarityLabel: '시즌', collected: false },
  { id: 's3', name: '큰기러기', rarityLabel: '시즌', collected: false },
];

export default function HomeScreen() {
  const theme = useTheme();
  const pct = COLLECTED / TOTAL;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View style={[styles.pad, styles.header]}>
            <View style={styles.headerText}>
              <View style={styles.greetingRow}>
                <ThemedText style={styles.greeting}>오늘도 새록새록</ThemedText>
                <Sparrow size={38} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                동네 새들이 당신을 기다려요
              </ThemedText>
            </View>
            <View style={[styles.regionChip, { backgroundColor: theme.tintSubtle }]}>
              <MapPin size={14} color={theme.tint} />
              <ThemedText type="smallBold" style={{ color: theme.tint }}>
                {REGION}
              </ThemedText>
            </View>
          </View>

          {/* 진행률 카드 */}
          <ThemedView type="backgroundElement" style={[styles.pad, styles.progressCard]}>
            <View style={styles.progressTop}>
              <ThemedText type="smallBold">{REGION} 도감</ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.tint }}>
                {Math.round(pct * 100)}%
              </ThemedText>
            </View>
            <View style={styles.countRow}>
              <ThemedText style={styles.count}>{COLLECTED}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.countTotal}>
                {' '}
                / {TOTAL}종
              </ThemedText>
            </View>
            <ProgressBar value={pct} />
            <ThemedText type="small" themeColor="textSecondary">
              동네 도감을 채워보세요!
            </ThemedText>
          </ThemedView>

          {/* 메인 CTA */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/camera')}
            style={({ pressed }) => [styles.pad, styles.cta, { backgroundColor: theme.tint, opacity: pressed ? 0.9 : 1 }]}>
            <Camera size={20} color={theme.onTint} />
            <ThemedText type="smallBold" style={{ color: theme.onTint }}>
              촬영하기
            </ThemedText>
          </Pressable>

          {/* 최근 등록한 새 */}
          <SectionHeader title="최근 등록한 새" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {RECENT.map((bird) => (
              <BirdCard key={bird.id} {...bird} />
            ))}
          </ScrollView>

          {/* 이번 시즌 새 */}
          <SectionHeader title="이번 시즌 새" subtitle="아직 못 만난 새" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {SEASON.map((bird) => (
              <BirdCard key={bird.id} {...bird} />
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={[styles.pad, styles.sectionHeader]}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingVertical: Spacing.four, gap: Spacing.four },
  pad: { marginHorizontal: Spacing.four },

  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.three },
  headerText: { flex: 1, gap: Spacing.one },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  greeting: { fontSize: 26, fontWeight: 700, lineHeight: 32 },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },

  progressCard: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'flex-end' },
  count: { fontSize: 36, fontWeight: 800, lineHeight: 40 },
  countTotal: { marginBottom: 6 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },

  sectionHeader: { gap: Spacing.half },
  sectionTitle: { fontSize: 19, fontWeight: 700 },
  row: { gap: Spacing.three, paddingHorizontal: Spacing.four, paddingVertical: Spacing.one },
});
