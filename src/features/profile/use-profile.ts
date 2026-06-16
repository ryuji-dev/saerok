import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-provider';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  displayName: string | null;
  regionCode: string | null;
  level: number;
  xp: number;
};

/** 현재 사용자 프로필. handle_new_user 트리거로 가입 시 행이 생성된다. */
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, region_code, level, xp')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        displayName: data.display_name,
        regionCode: data.region_code,
        level: data.level,
        xp: data.xp,
      } satisfies Profile;
    },
  });
}

/** 동네(region_code) 설정/변경. 온보딩·프로필에서 사용. */
export function useUpdateRegion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (regionCode: string) => {
      if (!user) throw new Error('로그인이 필요해요.');
      const { error } = await supabase
        .from('profiles')
        .update({ region_code: regionCode, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
