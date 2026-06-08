import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirdCard } from '@/components/bird-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSpeciesList } from '@/features/species/use-species';
import { useTheme } from '@/hooks/use-theme';

const COLUMNS = 3;
const GAP = Spacing.three;
const PAD = Spacing.four;

export default function DexGridScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { data: species = [], isLoading, isError, error } = useSpeciesList();

  const cardWidth = Math.floor((width - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
  const collected = species.filter((s) => s.collected).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        {isLoading ? (
          <ActivityIndicator color={theme.tint} style={styles.loader} />
        ) : isError ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.error}>
            데이터를 불러오지 못했어요: {(error as Error).message}
          </ThemedText>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ThemedText type="small" themeColor="textSecondary">
              {collected} / {species.length}종 수집
            </ThemedText>

            <View style={styles.grid}>
              {species.map((b) => (
                <BirdCard
                  key={b.id}
                  name={b.name}
                  rarityLabel={b.rarityLabel}
                  collected={b.collected}
                  width={cardWidth}
                  onPress={() => router.push({ pathname: '/bird/[id]', params: { id: b.id } })}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  loader: { marginTop: Spacing.six },
  error: { padding: Spacing.four },
  content: { padding: PAD, gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
