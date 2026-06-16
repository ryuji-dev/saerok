import { router, Stack } from 'expo-router';
import { SearchX, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirdCard } from '@/components/bird-card';
import { BirdGridSkeleton } from '@/components/skeleton';
import { EmptyState, ErrorState } from '@/components/state-views';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { RARITY_COLOR, RARITY_LABEL, RARITY_ORDER, type Rarity } from '@/data/birds';
import { useCollectedPhotos } from '@/features/catches/use-catches';
import { useProfile } from '@/features/profile/use-profile';
import { useSpeciesList } from '@/features/species/use-species';
import { useTheme } from '@/hooks/use-theme';

const COLUMNS = 3;
const GAP = Spacing.three;
const PAD = Spacing.four;

type Status = 'all' | 'collected' | 'missing';
const STATUS_LABEL: Record<Status, string> = { all: '전체', collected: '모음', missing: '미수집' };

export default function DexGridScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { data: profile } = useProfile();
  const { data: photos } = useCollectedPhotos();
  const { data: species = [], isLoading, isError, error, refetch } = useSpeciesList();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [rarity, setRarity] = useState<Rarity | 'all'>('all');

  const cardWidth = Math.floor((width - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return species.filter((s) => {
      if (status === 'collected' && !s.collected) return false;
      if (status === 'missing' && s.collected) return false;
      if (rarity !== 'all' && s.rarity !== rarity) return false;
      if (q && !`${s.name} ${s.nameEn}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [species, query, status, rarity]);

  const collected = species.filter((s) => s.collected).length;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: profile?.regionCode ? `${profile.regionCode} 도감` : '도감' }} />
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        {isLoading ? (
          <View style={styles.content}>
            <BirdGridSkeleton width={cardWidth} />
          </View>
        ) : isError ? (
          <ErrorState message={`데이터를 불러오지 못했어요.\n${(error as Error).message}`} onRetry={() => refetch()} />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* 검색 */}
            <View style={[styles.search, { backgroundColor: theme.backgroundElement }]}>
              <Search size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="새 이름으로 검색"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            {/* 상태 필터 */}
            <View style={styles.statusRow}>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <Chip
                  key={s}
                  label={STATUS_LABEL[s]}
                  active={status === s}
                  activeBg={theme.tint}
                  activeText={theme.onTint}
                  onPress={() => setStatus(s)}
                  style={styles.statusChip}
                />
              ))}
            </View>

            {/* 희귀도 필터 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rarityRow}>
              <Chip label="모든 등급" active={rarity === 'all'} activeBg={theme.tint} activeText={theme.onTint} onPress={() => setRarity('all')} />
              {RARITY_ORDER.map((r) => (
                <Chip
                  key={r}
                  label={RARITY_LABEL[r]}
                  active={rarity === r}
                  activeBg={RARITY_COLOR[r]}
                  activeText="#ffffff"
                  onPress={() => setRarity(r)}
                />
              ))}
            </ScrollView>

            <ThemedText type="small" themeColor="textSecondary">
              {collected} / {species.length}종 수집 · {filtered.length}종 표시 중
            </ThemedText>

            {filtered.length === 0 ? (
              <EmptyState icon={SearchX} title="조건에 맞는 새가 없어요" subtitle="검색어나 필터를 바꿔보세요." />
            ) : (
              <View style={styles.grid}>
                {filtered.map((b) => (
                  <BirdCard
                    key={b.id}
                    name={b.name}
                    rarity={b.rarity}
                    rarityLabel={b.rarityLabel}
                    collected={b.collected}
                    sensitive={b.sensitiveFlag}
                    photoUrl={photos?.get(b.id)}
                    width={cardWidth}
                    onPress={() => router.push({ pathname: '/bird/[id]', params: { id: b.id } })}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function Chip({
  label,
  active,
  activeBg,
  activeText,
  onPress,
  style,
}: {
  label: string;
  active: boolean;
  activeBg: string;
  activeText: string;
  onPress: () => void;
  style?: object;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        style,
        { backgroundColor: active ? activeBg : theme.backgroundElement, opacity: pressed ? 0.85 : 1 },
      ]}>
      <ThemedText type="small" style={{ color: active ? activeText : theme.textSecondary, fontWeight: active ? '700' : '500' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: PAD, gap: Spacing.three },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },

  statusRow: { flexDirection: 'row', gap: Spacing.two },
  statusChip: { flex: 1, alignItems: 'center' },
  rarityRow: { gap: Spacing.two, paddingVertical: Spacing.half },

  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
