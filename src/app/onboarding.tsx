import { router } from 'expo-router';
import { Camera, Check, Leaf, MapPin, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { SEOUL_DISTRICTS } from '@/data/regions';
import { useProfile, useUpdateRegion } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';

type SlideIcon = typeof Camera;
type Slide = { icon: SlideIcon; title: string; body: string };

// 앱의 핵심 가치 3가지: 실시간 촬영·AI 식별 / 동네 도감 / 생태 윤리.
const SLIDES: Slide[] = [
  {
    icon: Camera,
    title: '사진으로 새를 기록해요',
    body: '촬영 탭에서 새를 찍으면 AI가 종을 알려줘요.\n실시간 촬영만 인정돼 공정하게 모을 수 있어요.',
  },
  {
    icon: MapPin,
    title: '우리 동네 도감을 채워요',
    body: '내가 사는 동네를 기준으로 도감과 진행률이 쌓여요.\n동네마다 만나는 새가 달라요.',
  },
  {
    icon: Leaf,
    title: '새와 자연을 함께 지켜요',
    body: '멸종위기·민감종은 관측 위치를 가려요.\n희귀종만 좇지 않도록 설계했어요.',
  },
];

export default function OnboardingScreen() {
  const { data: profile } = useProfile();

  // 첫 방문(지역 미설정)이면 소개 슬라이드부터, 재진입(동네 변경)이면 곧장 선택 화면.
  const [step, setStep] = useState<'intro' | 'region'>(profile?.regionCode ? 'region' : 'intro');

  if (step === 'intro') {
    return <IntroSlides onDone={() => setStep('region')} />;
  }
  return <RegionPicker initial={profile?.regionCode ?? null} />;
}

function IntroSlides({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const Icon = slide.icon;

  const next = () => (isLast ? onDone() : setIndex((i) => i + 1));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* 건너뛰기 */}
        <View style={styles.skipRow}>
          <Pressable hitSlop={8} onPress={onDone}>
            <ThemedText type="small" themeColor="textSecondary">
              건너뛰기
            </ThemedText>
          </Pressable>
        </View>

        {/* 슬라이드 본문 */}
        <View style={styles.slideBody}>
          <View style={[styles.iconCircle, { backgroundColor: theme.tintSubtle }]}>
            <Icon color={theme.tint} size={56} strokeWidth={1.6} />
          </View>
          <ThemedText style={styles.slideTitle}>{slide.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {slide.body}
          </ThemedText>
        </View>

        {/* 페이지 표시 */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? theme.tint : theme.backgroundSelected, width: i === index ? 20 : 8 },
              ]}
            />
          ))}
        </View>

        {/* 다음 / 시작 */}
        <Pressable
          onPress={next}
          style={({ pressed }) => [styles.button, { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onTint }}>
            {isLast ? '동네 고르러 가기' : '다음'}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function RegionPicker({ initial }: { initial: string | null }) {
  const theme = useTheme();
  const updateRegion = useUpdateRegion();

  const [selected, setSelected] = useState<string | null>(initial);
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
          <MapPin color={theme.tint} size={36} />
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

  // 인트로 슬라이드
  skipRow: { alignItems: 'flex-end' },
  slideBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  slideTitle: { fontSize: 24, fontWeight: 800, lineHeight: 30, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.one, paddingVertical: Spacing.two },
  dot: { height: 8, borderRadius: 4 },

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
