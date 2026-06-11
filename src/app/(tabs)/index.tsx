import { router } from 'expo-router';
import { Bird, Camera, MapPin } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirdCard } from '@/components/bird-card';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/features/profile/use-profile';
import { useSpeciesList } from '@/features/species/use-species';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const region = profile?.regionCode ?? '내 동네';
  const { data: species = [], isLoading, isError, error } = useSpeciesList();

  const collected = species.filter((s) => s.collected);
  const uncollected = species.filter((s) => !s.collected);
  const total = species.length;
  const pct = total ? collected.length / total : 0;

  const openBird = (id: string) => router.push({ pathname: '/bird/[id]', params: { id } });

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
                {region}
              </ThemedText>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color={theme.tint} style={styles.loader} />
          ) : isError ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.pad}>
              데이터를 불러오지 못했어요: {(error as Error).message}
            </ThemedText>
          ) : (
            <>
              {/* 진행률 카드 (탭 → 전체 도감) */}
              <Pressable
                onPress={() => router.push('/dex')}
                style={({ pressed }) => [styles.pad, { opacity: pressed ? 0.92 : 1 }]}>
                <ThemedView type="backgroundElement" style={styles.progressCard}>
                  <View style={styles.progressTop}>
                    <ThemedText type="smallBold">{region} 도감</ThemedText>
                    <ThemedText type="smallBold" style={{ color: theme.tint }}>
                      {Math.round(pct * 100)}%
                    </ThemedText>
                  </View>
                  <View style={styles.countRow}>
                    <ThemedText style={styles.count}>{collected.length}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.countTotal}>
                      {' '}
                      / {total}종
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

              {/* 내가 모은 새 */}
              {collected.length > 0 ? (
                <>
                  <SectionHeader title="내가 모은 새" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                    {collected.map((b) => (
                      <BirdCard
                        key={b.id}
                        name={b.name}
                        rarity={b.rarity}
                        rarityLabel={b.rarityLabel}
                        collected={b.collected}
                        onPress={() => openBird(b.id)}
                      />
                    ))}
                  </ScrollView>
                </>
              ) : null}

              {/* 아직 못 만난 새 */}
              {uncollected.length > 0 ? (
                <>
                  <SectionHeader title="아직 못 만난 새" subtitle="촬영해서 도감에 담아보세요" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                    {uncollected.map((b) => (
                      <BirdCard
                        key={b.id}
                        name={b.name}
                        rarity={b.rarity}
                        rarityLabel={b.rarityLabel}
                        collected={b.collected}
                        onPress={() => openBird(b.id)}
                      />
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </>
          )}
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
  loader: { marginTop: Spacing.six },

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
