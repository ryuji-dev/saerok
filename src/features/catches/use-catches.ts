import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-provider';
import { supabase } from '@/lib/supabase';

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

/** 종을 도감에 등록(관측 기록 추가). 위치·사진·AI 신뢰도는 촬영/AI 단계에서 채운다. */
export function useRegisterCatch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (speciesId: string) => {
      if (!user) throw new Error('로그인이 필요해요.');
      const { error } = await supabase.from('catches').insert({
        user_id: user.id,
        species_id: Number(speciesId),
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
