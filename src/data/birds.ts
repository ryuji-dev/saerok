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
