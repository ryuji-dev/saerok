import { useQuery } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';

/** Smoke-test query: proves the app can reach Supabase + the `species` table. */
function useSpeciesCount() {
  return useQuery({
    queryKey: ['species-count'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { count, error } = await supabase.from('species').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function ConnectionStatus() {
  const { data, isLoading, isError, error } = useSpeciesCount();

  if (!isSupabaseConfigured) {
    return <ThemedText type="small">⚠️ .env에 Supabase URL / anon key를 설정하세요.</ThemedText>;
  }
  if (isLoading) {
    return <ThemedText type="small">Supabase 연결 확인 중…</ThemedText>;
  }
  if (isError) {
    return <ThemedText type="small">연결 응답 받음(테이블 미생성 가능): {(error as Error).message}</ThemedText>;
  }
  return <ThemedText type="smallBold">✅ Supabase 연결됨 · 등록 종 {data}개</ThemedText>;
}

export default function DexScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedText type="subtitle">내 도감</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          동네 → 시 → 도 → 전국 계층별 수집 진행률이 여기에 표시됩니다.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">성동구</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            0 / 0 종 · 0% (Phase 2에서 구현)
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">백엔드 연결</ThemedText>
          <ConnectionStatus />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  card: {
    alignSelf: 'stretch',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
