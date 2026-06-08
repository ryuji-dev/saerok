import { useQuery } from '@tanstack/react-query';

import { RARITY_LABEL, type Rarity } from '@/data/birds';
import { supabase } from '@/lib/supabase';

/** `species` 테이블 행 (생성 타입 도입 전 임시 정의). */
type SpeciesRow = {
  id: number;
  name_ko: string;
  name_en: string | null;
  scientific_name: string | null;
  rarity: Rarity;
  habitat: string | null;
  season: string | null;
  description: string | null;
  sensitive_flag: boolean;
};

export type Species = {
  id: string;
  name: string;
  nameEn: string;
  scientificName: string;
  rarity: Rarity;
  rarityLabel: string;
  habitat: string;
  season: string;
  description: string;
  sensitiveFlag: boolean;
  /** TODO: 인증 + catches 연동 후 실제 수집 여부로 교체. 지금은 개발용 더미. */
  collected: boolean;
};

// 임시: 로그인/catches 붙기 전까지 "수집함"으로 표시할 종 (이름 기준).
const DEV_COLLECTED = new Set(['참새', '까치', '직박구리', '박새', '멧비둘기', '붉은머리오목눈이']);

function mapRow(row: SpeciesRow): Species {
  return {
    id: String(row.id),
    name: row.name_ko,
    nameEn: row.name_en ?? '',
    scientificName: row.scientific_name ?? '',
    rarity: row.rarity,
    rarityLabel: RARITY_LABEL[row.rarity] ?? '',
    habitat: row.habitat ?? '정보 없음',
    season: row.season ?? '정보 없음',
    description: row.description ?? '',
    sensitiveFlag: row.sensitive_flag,
    collected: DEV_COLLECTED.has(row.name_ko),
  };
}

export function useSpeciesList() {
  return useQuery({
    queryKey: ['species'],
    queryFn: async () => {
      const { data, error } = await supabase.from('species').select('*').order('id').returns<SpeciesRow[]>();
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });
}

export function useSpecies(id: string) {
  return useQuery({
    queryKey: ['species', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('species')
        .select('*')
        .eq('id', id)
        .single<SpeciesRow>();
      if (error) throw error;
      return mapRow(data);
    },
  });
}
