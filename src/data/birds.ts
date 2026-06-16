// 희귀도 타입/라벨. DB enum(public.rarity)과 일치해야 함.
// 종 데이터 자체는 Supabase에서 로드한다 (src/features/species).
export type Rarity = 'common' | 'uncommon' | 'seasonal' | 'endangered' | 'legendary';

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '흔함',
  uncommon: '드묾',
  seasonal: '시즌',
  endangered: '멸종위기',
  legendary: '레전더리',
};

/** 희귀도별 강조색. 라이트/다크 양쪽에서 읽히는 중간 톤. 뱃지·필터칩 공용. */
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#64748B', // slate
  uncommon: '#0D9488', // teal
  seasonal: '#D97706', // amber
  endangered: '#DC2626', // red
  legendary: '#7C3AED', // violet
};

/** 도감 필터·표시 순서(흔함 → 레어 순). */
export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'seasonal', 'endangered', 'legendary'];
