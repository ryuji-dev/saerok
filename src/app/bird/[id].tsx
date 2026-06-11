import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Bird, Check, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCollectedPhotos, useRegisterCatch, useUnregisterCatch } from '@/features/catches/use-catches';
import { useSpecies } from '@/features/species/use-species';
import { useTheme } from '@/hooks/use-theme';

export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: bird, isLoading, isError } = useSpecies(id);
  const { data: photos } = useCollectedPhotos();
  const register = useRegisterCatch();
  const unregister = useUnregisterCatch();
  const [error, setError] = useState<string | null>(null);

  const busy = register.isPending || unregister.isPending;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.notFound}>
          <ActivityIndicator color={theme.tint} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isError || !bird) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.notFound}>
          <ThemedText type="subtitle">새를 찾을 수 없어요</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const locked = !bird.collected;
  const photoUrl = photos?.get(bird.id);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: locked ? '???' : bird.name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 대표 이미지 */}
        <View style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
          {!locked && photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.heroPhoto} contentFit="cover" transition={150} />
          ) : locked ? (
            <Lock size={56} color={theme.textSecondary} />
          ) : (
            <Bird size={76} color={theme.tint} />
          )}
          <View style={[styles.badge, { backgroundColor: locked ? theme.background : theme.tintSubtle }]}>
            <ThemedText type="smallBold" style={{ color: locked ? theme.textSecondary : theme.tint }}>
              {bird.rarityLabel}
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
        <ThemedText type="default" themeColor={locked ? 'textSecondary' : 'text'} style={styles.desc}>
          {locked ? '도감에 등록하면 정보가 공개돼요.' : bird.description || '설명이 아직 없어요.'}
        </ThemedText>

        {/* 등록 / 해제 */}
        {locked ? (
          <Pressable
            disabled={busy}
            onPress={() => {
              setError(null);
              register.mutate({ speciesId: bird.id }, { onError: (e) => setError((e as Error).message) });
            }}
            style={({ pressed }) => [styles.cta, { backgroundColor: theme.tint, opacity: pressed || busy ? 0.85 : 1 }]}>
            {busy ? (
              <ActivityIndicator color={theme.onTint} />
            ) : (
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                이 새를 봤어요 · 도감에 등록
              </ThemedText>
            )}
          </Pressable>
        ) : (
          <View style={styles.registeredBlock}>
            <View style={[styles.registeredBadge, { backgroundColor: theme.tintSubtle }]}>
              <Check size={18} color={theme.tint} />
              <ThemedText type="smallBold" style={{ color: theme.tint }}>
                도감에 등록됨
              </ThemedText>
            </View>
            <Pressable
              disabled={busy}
              onPress={() => {
                setError(null);
                unregister.mutate(bird.id, { onError: (e) => setError((e as Error).message) });
              }}
              style={styles.unregister}>
              <ThemedText type="small" themeColor="textSecondary">
                {busy ? '처리 중…' : '등록 해제'}
              </ThemedText>
            </Pressable>
          </View>
        )}

        {error ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
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
    overflow: 'hidden',
  },
  heroPhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
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
  cta: { height: 52, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  registeredBlock: { alignItems: 'center', gap: Spacing.two },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  unregister: { paddingVertical: Spacing.one },
  error: { textAlign: 'center' },
});
