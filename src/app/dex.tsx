import { router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirdCard } from '@/components/bird-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { MOCK_BIRDS, RARITY_LABEL } from '@/data/birds';

const COLUMNS = 3;
const GAP = Spacing.three;
const PAD = Spacing.four;

export default function DexGridScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

  const collected = MOCK_BIRDS.filter((b) => b.collected).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="small" themeColor="textSecondary">
            {collected} / {MOCK_BIRDS.length}종 수집
          </ThemedText>

          <View style={styles.grid}>
            {MOCK_BIRDS.map((b) => (
              <BirdCard
                key={b.id}
                name={b.name}
                rarityLabel={RARITY_LABEL[b.rarity]}
                collected={b.collected}
                width={cardWidth}
                onPress={() => router.push({ pathname: '/bird/[id]', params: { id: b.id } })}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: PAD, gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
});
