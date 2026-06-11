import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/profile/use-profile';
import { supabase } from '@/lib/supabase';

const PHOTO_BUCKET = 'catch-photos';
const SIGNED_URL_TTL = 60 * 60; // 1시간

/** base64(또는 data URL) → Uint8Array. 외부 의존성 없이 RN/웹 양쪽에서 동작. */
const B64_LOOKUP = (() => {
  const table = new Uint8Array(256);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let i = 0; i < chars.length; i++) table[chars.charCodeAt(i)] = i;
  return table;
})();

function base64ToBytes(input: string): Uint8Array {
  let s = input;
  if (s.startsWith('data:')) {
    const comma = s.indexOf(',');
    if (comma !== -1) s = s.slice(comma + 1);
  }
  s = s.replace(/[^A-Za-z0-9+/=]/g, '');
  const len = s.length;
  let padding = 0;
  if (len >= 1 && s[len - 1] === '=') padding++;
  if (len >= 2 && s[len - 2] === '=') padding++;
  const byteLength = Math.floor((len * 3) / 4) - padding;
  const bytes = new Uint8Array(byteLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e0 = B64_LOOKUP[s.charCodeAt(i)];
    const e1 = B64_LOOKUP[s.charCodeAt(i + 1)];
    const e2 = B64_LOOKUP[s.charCodeAt(i + 2)];
    const e3 = B64_LOOKUP[s.charCodeAt(i + 3)];
    if (p < byteLength) bytes[p++] = (e0 << 2) | (e1 >> 4);
    if (p < byteLength) bytes[p++] = ((e1 & 15) << 4) | (e2 >> 2);
    if (p < byteLength) bytes[p++] = ((e2 & 3) << 6) | (e3 & 63);
  }
  return bytes;
}

/** 내가 수집(관측 등록)한 종 id 집합. RLS로 본인 catches 만 조회된다. */
export function useCollectedIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['catches', 'collected', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('catches').select('species_id').not('species_id', 'is', null);
      if (error) throw error;
      return new Set((data ?? []).map((row) => String(row.species_id)));
    },
  });
}

/** 종 id → 최신 catch 사진 서명 URL. 비공개 버킷이라 서명 URL을 발급해 표시한다. */
export function useCollectedPhotos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['catches', 'photos', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catches')
        .select('species_id, photo_path, captured_at')
        .not('photo_path', 'is', null)
        .not('species_id', 'is', null)
        .order('captured_at', { ascending: false });
      if (error) throw error;

      // 종별 최신 사진 경로 1개만.
      const latestPath = new Map<string, string>();
      for (const row of data ?? []) {
        const sid = String(row.species_id);
        if (row.photo_path && !latestPath.has(sid)) latestPath.set(sid, row.photo_path);
      }
      const paths = [...latestPath.values()];
      const result = new Map<string, string>();
      if (paths.length === 0) return result;

      const { data: signed, error: signErr } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
      if (signErr) throw signErr;

      const urlByPath = new Map<string, string>();
      for (const item of signed ?? []) {
        if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
      }
      for (const [sid, path] of latestPath) {
        const url = urlByPath.get(path);
        if (url) result.set(sid, url);
      }
      return result;
    },
  });
}

export type CatchLocation = { lat: number; lng: number };

/**
 * 종을 도감에 등록(관측 기록 추가).
 * - 사진이 있으면 Storage 에 올리고 photo_path 를 저장한다.
 * - 위치가 있으면 PostGIS POINT 로 저장한다(민감종 마스킹은 DB 뷰에서 강제).
 * - region_code 는 프로필의 동네로 비정규화(지역 집계용). AI 신뢰도는 후속 단계.
 */
export function useRegisterCatch() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      speciesId,
      photoBase64,
      location,
    }: {
      speciesId: string;
      photoBase64?: string | null;
      location?: CatchLocation | null;
    }) => {
      if (!user) throw new Error('로그인이 필요해요.');

      let photoPath: string | null = null;
      if (photoBase64) {
        // RLS 규칙: 경로 첫 폴더가 본인 user_id 여야 한다.
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, base64ToBytes(photoBase64), { contentType: 'image/jpeg', upsert: false });
        if (uploadError) throw uploadError;
        photoPath = path;
      }

      const { error } = await supabase.from('catches').insert({
        user_id: user.id,
        species_id: Number(speciesId),
        photo_path: photoPath,
        // geography(Point,4326) — WKT는 경도(lng) 위도(lat) 순서.
        location: location ? `POINT(${location.lng} ${location.lat})` : null,
        region_code: profile?.regionCode ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catches'] });
    },
  });
}

/** 해당 종의 내 관측 기록을 모두 삭제(등록 해제). */
export function useUnregisterCatch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (speciesId: string) => {
      if (!user) throw new Error('로그인이 필요해요.');
      const { error } = await supabase
        .from('catches')
        .delete()
        .eq('user_id', user.id)
        .eq('species_id', Number(speciesId));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catches'] });
    },
  });
}
