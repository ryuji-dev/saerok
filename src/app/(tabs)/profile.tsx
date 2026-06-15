import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { Bird, Camera } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeToggle } from '@/components/theme-toggle';
import { Spacing } from '@/constants/theme';
import { RARITY_COLOR, RARITY_LABEL } from '@/data/birds';
import { useAuth } from '@/features/auth/auth-provider';
import { useCollectedIds, useMyCatches, type MyCatch } from '@/features/catches/use-catches';
import { useProfile } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: collectedIds } = useCollectedIds();
  const { data: myCatches } = useMyCatches(10);
  const region = profile?.regionCode ? `서울 ${profile.regionCode}` : '지역 미설정';
  const xp = profile?.xp ?? 0;
  const xpInLevel = xp % 100; // 100 XP = 1 레벨

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">프로필</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{user?.email ?? '탐조인'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Lv.{profile?.level ?? 1} · XP {xp} · {region}
            </ThemedText>
            <View style={styles.xpBlock}>
              <ProgressBar value={xpInLevel / 100} />
              <ThemedText type="small" themeColor="textSecondary">
                다음 레벨까지 {100 - xpInLevel} XP
              </ThemedText>
            </View>
          </ThemedView>

          {/* 수집 통계 */}
          <View style={styles.statsRow}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: theme.tint }]}>{collectedIds?.size ?? 0}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                모은 종
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: theme.tint }]}>{myCatches?.total ?? 0}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                관측 기록
              </ThemedText>
            </ThemedView>
          </View>

          {/* 최근 관측 기록 */}
          <ThemedText type="smallBold">최근 관측 기록</ThemedText>
          {!myCatches || myCatches.items.length === 0 ? (
            <ThemedView type="backgroundElement" style={[styles.card, styles.emptyCard]}>
              <Camera size={22} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                아직 관측 기록이 없어요. 촬영 탭에서 첫 새를 만나보세요!
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.listCard}>
              {myCatches.items.map((c, i) => (
                <CatchRow key={c.id} item={c} isLast={i === myCatches.items.length - 1} />
              ))}
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">화면 테마</ThemedText>
            <ThemeToggle />
          </ThemedView>

          <Link href="/onboarding" asChild>
            <ThemedText type="linkPrimary">동네 변경 →</ThemedText>
          </Link>

          <Pressable onPress={signOut} style={styles.logout}>
            <ThemedText type="small" themeColor="textSecondary">
              로그아웃
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function CatchRow({ item, isLast }: { item: MyCatch; isLast: boolean }) {
  const theme = useTheme();
  const color = item.rarity ? RARITY_COLOR[item.rarity] : theme.textSecondary;

  return (
    <Pressable
      disabled={!item.speciesId}
      onPress={() => item.speciesId && router.push({ pathname: '/bird/[id]', params: { id: item.speciesId } })}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundSelected, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.rowThumb, { backgroundColor: theme.backgroundSelected }]}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.rowPhoto} contentFit="cover" transition={120} />
        ) : (
          <Bird size={20} color={theme.tint} />
        )}
      </View>
      <View style={styles.rowBody}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {formatDate(item.capturedAt)}
          {item.regionCode ? ` · ${item.regionCode}` : ''}
        </ThemedText>
      </View>
      {item.rarity ? (
        <View style={[styles.rarityBadge, { backgroundColor: `${color}24` }]}>
          <ThemedText type="small" style={{ color, fontSize: 11 }}>
            {RARITY_LABEL[item.rarity]}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  card: { alignSelf: 'stretch', gap: Spacing.one, padding: Spacing.three, borderRadius: Spacing.three },
  xpBlock: { gap: Spacing.one, marginTop: Spacing.one },
  center: { textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statCard: { flex: 1, alignItems: 'center', gap: Spacing.half, padding: Spacing.three, borderRadius: Spacing.three },
  statNumber: { fontSize: 28, fontWeight: 800, lineHeight: 34 },

  emptyCard: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  listCard: { borderRadius: Spacing.three, paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  rowThumb: { width: 44, height: 44, borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowPhoto: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: 2 },
  rarityBadge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: 999 },

  logout: { marginTop: Spacing.two, paddingBottom: Spacing.four },
});
