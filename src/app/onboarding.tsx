import { router } from 'expo-router';
import { Bird, Check, MapPin, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { SEOUL_DISTRICTS } from '@/data/regions';
import { useProfile, useUpdateRegion } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const updateRegion = useUpdateRegion();

  const [selected, setSelected] = useState<string | null>(profile?.regionCode ?? null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const districts = useMemo(() => {
    const q = query.trim();
    return q ? SEOUL_DISTRICTS.filter((d) => d.includes(q)) : [...SEOUL_DISTRICTS];
  }, [query]);

  const save = () => {
    if (!selected) return;
    setError(null);
    updateRegion.mutate(selected, {
      onSuccess: () => router.replace('/'),
      onError: (e) => setError((e as Error).message),
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Bird color={theme.tint} size={36} />
          <ThemedText style={styles.title}>어느 동네의 새를 모을까요?</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            선택한 동네를 기준으로 도감과 진행률이 표시돼요. 나중에 바꿀 수 있어요.
          </ThemedText>
        </View>

        {/* 검색 */}
        <View style={[styles.search, { backgroundColor: theme.backgroundElement }]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="구 이름 검색 (예: 성동)"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* 자치구 목록 */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {districts.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              검색 결과가 없어요.
            </ThemedText>
          ) : (
            districts.map((d) => {
              const active = selected === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setSelected(d)}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: active ? theme.tintSubtle : theme.backgroundElement, opacity: pressed ? 0.9 : 1 },
                  ]}>
                  <View style={styles.rowLeft}>
                    <MapPin size={16} color={active ? theme.tint : theme.textSecondary} />
                    <ThemedText type="smallBold" style={active ? { color: theme.tint } : undefined}>
                      서울 {d}
                    </ThemedText>
                  </View>
                  {active ? <Check size={18} color={theme.tint} /> : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {error ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {error}
          </ThemedText>
        ) : null}

        {/* 시작 */}
        <Pressable
          disabled={!selected || updateRegion.isPending}
          onPress={save}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tint, opacity: !selected ? 0.4 : pressed || updateRegion.isPending ? 0.85 : 1 },
          ]}>
          {updateRegion.isPending ? (
            <ActivityIndicator color={theme.onTint} />
          ) : (
            <ThemedText type="smallBold" style={{ color: theme.onTint }}>
              {selected ? `서울 ${selected}로 시작하기` : '동네를 선택해 주세요'}
            </ThemedText>
          )}
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  header: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.four },
  title: { fontSize: 24, fontWeight: 800, lineHeight: 30, textAlign: 'center' },
  center: { textAlign: 'center' },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },

  list: { flex: 1 },
  listContent: { gap: Spacing.two, paddingVertical: Spacing.one },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  empty: { textAlign: 'center', paddingVertical: Spacing.six },

  button: { height: 52, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center' },
});
