import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Camera as CameraIcon, RefreshCw, ShieldCheck, SwitchCamera } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { RARITY_COLOR, type Rarity } from '@/data/birds';
import { useRegisterCatch } from '@/features/catches/use-catches';
import { useSpeciesList, type Species } from '@/features/species/use-species';
import { useTheme } from '@/hooks/use-theme';

type Candidate = { id: string; name: string; rarity: Rarity; rarityLabel: string; confidence: number };
type Phase = 'camera' | 'identifying' | 'result';

/**
 * 스텁 AI 식별: 종 목록에서 3종을 뽑아 내림차순 신뢰도를 붙인다.
 * 실제 식별 엔진(비전 모델/iNat 등)은 Edge Function 프록시로 후속 연결.
 */
function fakeIdentify(species: Species[]): Candidate[] {
  const pool = [...species];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const confs = [0.86, 0.61, 0.39];
  return pool.slice(0, 3).map((s, i) => ({
    id: s.id,
    name: s.name,
    rarity: s.rarity,
    rarityLabel: s.rarityLabel,
    confidence: confs[i] ?? 0.3,
  }));
}

export default function CameraScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { data: species = [] } = useSpeciesList();
  const register = useRegisterCatch();
  const cameraRef = useRef<CameraView>(null);

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [phase, setPhase] = useState<Phase>('camera');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shoot = async () => {
    setError(null);
    try {
      const pic = await cameraRef.current?.takePictureAsync({ quality: 0.6, base64: true });
      if (!pic) return;
      setPhotoUri(pic.uri);
      setPhotoBase64(pic.base64 ?? null);
      setPhase('identifying');
      // 추론 지연 시뮬레이션 후 후보 제시
      setTimeout(() => {
        setCandidates(fakeIdentify(species));
        setPhase('result');
      }, 900);
    } catch {
      setError('촬영에 실패했어요. 다시 시도해 주세요.');
    }
  };

  const reset = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setCandidates([]);
    setBusyId(null);
    setError(null);
    setPhase('camera');
  };

  const choose = (c: Candidate) => {
    setBusyId(c.id);
    setError(null);
    register.mutate(
      { speciesId: c.id, photoBase64 },
      {
        onSuccess: () => {
          reset();
          router.push({ pathname: '/bird/[id]', params: { id: c.id } });
        },
        onError: (e) => {
          setBusyId(null);
          setError((e as Error).message);
        },
      },
    );
  };

  // 권한 로딩/요청 게이트
  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centerArea}>
          <ActivityIndicator color={theme.tint} />
        </SafeAreaView>
      </ThemedView>
    );
  }
  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centerArea}>
          <CameraIcon size={48} color={theme.textSecondary} />
          <ThemedText type="subtitle">카메라 권한이 필요해요</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            새를 실시간으로 촬영해 도감에 등록하려면 카메라 접근을 허용해 주세요.
          </ThemedText>
          <Pressable onPress={requestPermission} style={[styles.primary, { backgroundColor: theme.tint }]}>
            <ThemedText type="smallBold" style={{ color: theme.onTint }}>
              카메라 허용하기
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 식별 결과
  if (phase === 'result') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.resultArea}>
          <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}

            <View style={styles.resultHead}>
              <ThemedText type="subtitle">이 새가 맞나요?</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                AI가 제안한 후보예요. 가장 가까운 새를 골라 도감에 등록하세요.
              </ThemedText>
            </View>

            {candidates.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                후보를 불러오지 못했어요. 다시 촬영해 주세요.
              </ThemedText>
            ) : (
              candidates.map((c, i) => {
                const color = RARITY_COLOR[c.rarity];
                const pct = Math.round(c.confidence * 100);
                return (
                  <Pressable
                    key={c.id}
                    disabled={busyId !== null}
                    onPress={() => choose(c)}
                    style={({ pressed }) => [
                      styles.candidate,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: i === 0 ? theme.tint : 'transparent',
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}>
                    <View style={styles.candidateTop}>
                      <ThemedText type="smallBold">{c.name}</ThemedText>
                      {busyId === c.id ? (
                        <ActivityIndicator color={theme.tint} />
                      ) : (
                        <View style={[styles.rarityBadge, { backgroundColor: `${color}24` }]}>
                          <ThemedText type="small" style={{ color, fontSize: 11 }}>
                            {c.rarityLabel}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={styles.confRow}>
                      <View style={[styles.confTrack, { backgroundColor: theme.backgroundSelected }]}>
                        <View style={[styles.confFill, { width: `${pct}%`, backgroundColor: theme.tint }]} />
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        신뢰도 {pct}%
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })
            )}

            {error ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable onPress={reset} disabled={busyId !== null} style={styles.retake}>
              <RefreshCw size={16} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                이 중에 없어요 · 다시 촬영
              </ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // 카메라 / 식별 중
  return (
    <ThemedView style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

        {/* 안티치팅 안내 */}
        <SafeAreaView edges={['top']} style={styles.overlayTop} pointerEvents="box-none">
          <View style={styles.antiCheat}>
            <ShieldCheck size={14} color="#fff" />
            <ThemedText type="small" style={styles.antiCheatText}>
              실시간 촬영만 · 갤러리 업로드 차단
            </ThemedText>
          </View>
        </SafeAreaView>

        {/* 식별 중 오버레이 */}
        {phase === 'identifying' ? (
          <View style={styles.identifying}>
            {photoUri ? <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} blurRadius={2} /> : null}
            <View style={styles.identifyingInner}>
              <ActivityIndicator color="#fff" size="large" />
              <ThemedText type="smallBold" style={styles.identifyingText}>
                AI가 새를 분석하고 있어요…
              </ThemedText>
            </View>
          </View>
        ) : (
          <SafeAreaView edges={['bottom']} style={styles.controls} pointerEvents="box-none">
            <ThemedText type="small" style={styles.hint}>
              새를 화면 가운데에 담고 촬영하세요
            </ThemedText>
            <View style={styles.controlsRow}>
              <View style={styles.sideSlot} />
              <Pressable onPress={shoot} style={styles.shutter}>
                <View style={styles.shutterInner} />
              </Pressable>
              <View style={styles.sideSlot}>
                <Pressable onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} style={styles.flip}>
                  <SwitchCamera size={22} color="#fff" />
                </Pressable>
              </View>
            </View>
            {error ? (
              <ThemedText type="small" style={styles.hint}>
                {error}
              </ThemedText>
            ) : null}
          </SafeAreaView>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerArea: { flex: 1, padding: Spacing.four, gap: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  primary: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderRadius: Spacing.three, marginTop: Spacing.two },

  cameraWrap: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },

  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingTop: Spacing.two },
  antiCheat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  antiCheatText: { color: '#fff', fontSize: 12 },

  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.four },
  hint: { color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: Spacing.five },
  sideSlot: { width: 48, alignItems: 'center', justifyContent: 'center' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  flip: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },

  identifying: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  identifyingInner: { alignItems: 'center', gap: Spacing.three },
  identifyingText: { color: '#fff' },

  resultArea: { flex: 1 },
  resultContent: { padding: Spacing.four, gap: Spacing.three },
  preview: { width: '100%', aspectRatio: 1.2, borderRadius: Spacing.four, backgroundColor: '#000' },
  resultHead: { gap: Spacing.one },

  candidate: { borderRadius: Spacing.three, borderWidth: 1.5, padding: Spacing.three, gap: Spacing.two },
  candidateTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rarityBadge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: 999 },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  confTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 3 },

  retake: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: Spacing.three, marginTop: Spacing.one },
});
