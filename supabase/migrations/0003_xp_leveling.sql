-- 0003_xp_leveling.sql — 수집 시 희귀도 기반 XP 부여 + 레벨 자동 계산
-- 규칙: 100 XP = 1 레벨. catches insert/delete 시 profiles.xp/level 을 트리거로 갱신.
-- 클라이언트가 직접 XP 를 못 올리도록 서버(DB)에서 강제한다(안티치팅).

-- 희귀도 → 부여 XP
create or replace function public.catch_xp(r public.rarity)
returns int
language sql
immutable
as $$
  select case r
    when 'common'     then 10
    when 'uncommon'   then 20
    when 'seasonal'   then 30
    when 'endangered' then 60
    when 'legendary'  then 120
    else 10
  end;
$$;

-- catches 변경 시 해당 사용자의 xp/level 갱신
create or replace function public.apply_catch_xp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  r      public.rarity;
  delta  int := 0;
begin
  if (tg_op = 'INSERT') then
    target := new.user_id;
    if new.species_id is not null then
      select rarity into r from public.species where id = new.species_id;
      if r is not null then delta := public.catch_xp(r); end if;
    end if;
  elsif (tg_op = 'DELETE') then
    target := old.user_id;
    if old.species_id is not null then
      select rarity into r from public.species where id = old.species_id;
      if r is not null then delta := -public.catch_xp(r); end if;
    end if;
  end if;

  if delta <> 0 then
    update public.profiles
      set xp = greatest(0, xp + delta),
          level = greatest(1, greatest(0, xp + delta) / 100 + 1),
          updated_at = now()
    where id = target;
  end if;

  return null;
end;
$$;

drop trigger if exists on_catch_xp on public.catches;
create trigger on_catch_xp
after insert or delete on public.catches
for each row execute function public.apply_catch_xp();
