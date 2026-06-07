import { router } from 'expo-router';
import { Bird, Camera, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirdCard } from '@/components/bird-card';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { MOCK_BIRDS, RARITY_LABEL, RECENT_BIRDS, SEASON_BIRDS } from '@/data/birds';
import { useTheme } from '@/hooks/use-theme';

const REGION = '성동구';
const COLLECTED = MOCK_BIRDS.filter((b) => b.collected).length;
const TOTAL = MOCK_BIRDS.length;

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
                <Bird color={theme.tint} size={30} />
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

          {/* 진행률 카드 (탭 → 전체 도감) */}
          <Pressable
            onPress={() => router.push('/dex')}
            style={({ pressed }) => [styles.pad, { opacity: pressed ? 0.92 : 1 }]}>
            <ThemedView type="backgroundElement" style={styles.progressCard}>
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
              <View style={styles.progressFooter}>
                <ThemedText type="small" themeColor="textSecondary">
                  동네 도감을 채워보세요!
                </ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.tint }}>
                  전체 보기 ›
                </ThemedText>
              </View>
            </ThemedView>
          </Pressable>

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
            {RECENT_BIRDS.map((b) => (
              <BirdCard
                key={b.id}
                name={b.name}
                rarityLabel={RARITY_LABEL[b.rarity]}
                collected={b.collected}
                caption={b.caption}
                onPress={() => router.push({ pathname: '/bird/[id]', params: { id: b.id } })}
              />
            ))}
          </ScrollView>

          {/* 이번 시즌 새 */}
          <SectionHeader title="이번 시즌 새" subtitle="아직 못 만난 새" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {SEASON_BIRDS.map((b) => (
              <BirdCard
                key={b.id}
                name={b.name}
                rarityLabel={RARITY_LABEL[b.rarity]}
                collected={b.collected}
                onPress={() => router.push({ pathname: '/bird/[id]', params: { id: b.id } })}
              />
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
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

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
