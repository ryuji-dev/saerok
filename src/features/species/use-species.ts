import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { RARITY_LABEL, type Rarity } from '@/data/birds';
import { useCollectedIds } from '@/features/catches/use-catches';
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
  /** 내 catches 기록 기준 실제 수집 여부. */
  collected: boolean;
};

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
    collected: false, // useCollectedIds 와 병합해 채운다.
  };
}

export function useSpeciesList() {
  const speciesQuery = useQuery({
    queryKey: ['species'],
    queryFn: async () => {
      const { data, error } = await supabase.from('species').select('*').order('id').returns<SpeciesRow[]>();
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });
  const { data: collected } = useCollectedIds();

  const data = useMemo(() => {
    if (!speciesQuery.data) return undefined;
    if (!collected) return speciesQuery.data;
    return speciesQuery.data.map((s) => ({ ...s, collected: collected.has(s.id) }));
  }, [speciesQuery.data, collected]);

  return { ...speciesQuery, data };
}

export function useSpecies(id: string) {
  const speciesQuery = useQuery({
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
  const { data: collected } = useCollectedIds();

  const data = useMemo(() => {
    if (!speciesQuery.data) return undefined;
    return { ...speciesQuery.data, collected: collected?.has(speciesQuery.data.id) ?? false };
  }, [speciesQuery.data, collected]);

  return { ...speciesQuery, data };
}
