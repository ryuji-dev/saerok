import { Stack, useLocalSearchParams } from 'expo-router';
import { Bird, Lock } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getBird, RARITY_LABEL } from '@/data/birds';
import { useTheme } from '@/hooks/use-theme';

export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const bird = getBird(id);

  if (!bird) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.notFound}>
          <ThemedText type="subtitle">새를 찾을 수 없어요</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const locked = !bird.collected;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: locked ? '???' : bird.name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 대표 이미지 */}
        <View style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
          {locked ? <Lock size={56} color={theme.textSecondary} /> : <Bird size={76} color={theme.tint} />}
          <View style={[styles.badge, { backgroundColor: locked ? theme.background : theme.tintSubtle }]}>
            <ThemedText type="smallBold" style={{ color: locked ? theme.textSecondary : theme.tint }}>
              {RARITY_LABEL[bird.rarity]}
            </ThemedText>
          </View>
        </View>

        {/* 이름 */}
        <View style={styles.titleBlock}>
          <ThemedText style={styles.name}>{locked ? '???' : bird.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {locked ? '아직 만나지 못한 새예요' : `${bird.nameEn} · ${bird.scientificName}`}
          </ThemedText>
        </View>

        {/* 정보 */}
        <ThemedView type="backgroundElement" style={styles.infoCard}>
          <InfoRow label="서식지" value={locked ? '???' : bird.habitat} />
          <InfoRow label="시기" value={locked ? '???' : bird.season} />
          <InfoRow
            label="상태"
            value={locked ? '미수집' : '수집 완료'}
            valueColor={locked ? undefined : theme.tint}
          />
        </ThemedView>

        {/* 설명 */}
        <ThemedText
          type="default"
          themeColor={locked ? 'textSecondary' : 'text'}
          style={styles.desc}>
          {locked ? '촬영해서 도감에 등록하면 정보가 공개돼요.' : bird.description}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  hero: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  titleBlock: { gap: Spacing.one },
  name: { fontSize: 28, fontWeight: 800, lineHeight: 34 },
  infoCard: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.three },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  desc: { lineHeight: 24 },
});
