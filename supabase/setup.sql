-- 0001_init.sql — 새록(Saerok) 초기 스키마
-- TODO 데이터 모델: profiles / species / catches / dex_progress
-- 3대 리스크 중 '생태 윤리'를 위해 민감종 좌표 마스킹을 DB 레벨(RLS + 뷰)로 강제한다.

-- ─────────────────────────────────────────────────────────────
-- 확장 (지리 집계용 PostGIS)
-- 주의: public 스키마에 설치하면 Supabase advisor가 경고할 수 있음.
--       운영 단계에서 extensions 스키마로 이전 검토.
-- ─────────────────────────────────────────────────────────────
create extension if not exists postgis;

-- ─────────────────────────────────────────────────────────────
-- 열거형
-- ─────────────────────────────────────────────────────────────
create type public.rarity as enum ('common', 'uncommon', 'seasonal', 'endangered', 'legendary');
create type public.verified_status as enum ('pending', 'verified', 'rejected');

-- ─────────────────────────────────────────────────────────────
-- profiles : auth.users 와 1:1
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  region_code  text,                              -- 예: 성동구 행정구역 코드
  level        int  not null default 1,
  xp           int  not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- species : 도감 마스터 (흔한 새 20~30종으로 좁게 시작)
-- ─────────────────────────────────────────────────────────────
create table public.species (
  id              bigint generated always as identity primary key,
  name_ko         text not null,
  name_en         text,
  scientific_name text,
  rarity          public.rarity not null default 'common',
  habitat         text,
  sensitive_flag  boolean not null default false,  -- 멸종위기·민감종 → 위치 마스킹 대상
  season          text,                            -- 도래 시기 표시용 (예: '겨울 (10~3월)')
  season_window   jsonb,                           -- 구조화 도래 시기 (예: {"start":"10-01","end":"03-31"})
  description     text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- catches : 사용자 관측/수집 기록
-- ─────────────────────────────────────────────────────────────
create table public.catches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  species_id      bigint references public.species (id) on delete set null,
  location        geography(Point, 4326),          -- 관측 위치
  region_code     text,                            -- 비정규화: 지역 집계 가속
  photo_path      text,                            -- Storage(catch-photos) 경로
  confidence      numeric(4, 3),                   -- AI 식별 신뢰도 0~1
  verified_status public.verified_status not null default 'pending',
  captured_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index catches_user_idx     on public.catches (user_id);
create index catches_species_idx  on public.catches (species_id);
create index catches_region_idx   on public.catches (region_code);
create index catches_location_idx on public.catches using gist (location);

-- ─────────────────────────────────────────────────────────────
-- dex_progress : 지역별 수집 진행률 (뷰)
-- total 은 우선 전체 종 수로 단순화. 추후 '지역별 도래 종' 기준으로 정교화.
-- ─────────────────────────────────────────────────────────────
create view public.dex_progress as
select
  c.user_id,
  c.region_code,
  count(distinct c.species_id)            as collected,
  (select count(*) from public.species)   as total
from public.catches c
where c.species_id is not null
group by c.user_id, c.region_code;

-- ─────────────────────────────────────────────────────────────
-- 민감종 좌표 마스킹 공개 뷰 (지도/커뮤니티용)
-- sensitive_flag 종은 좌표를 비공개로, verified 만 노출.
-- ─────────────────────────────────────────────────────────────
create view public.catches_public as
select
  c.id,
  c.species_id,
  c.region_code,
  c.verified_status,
  c.captured_at,
  case when s.sensitive_flag then null else c.location end as location
from public.catches c
join public.species s on s.id = c.species_id
where c.verified_status = 'verified';

-- ─────────────────────────────────────────────────────────────
-- 신규 가입 시 profiles 자동 생성
-- ─────────────────────────────────────────────────────────────
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.species  enable row level security;
alter table public.catches  enable row level security;

-- profiles: 본인만
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- species: 누구나 읽기(도감 마스터). 쓰기 정책 없음 → service_role 만 가능.
create policy "species_select_all" on public.species for select using (true);

-- catches: 본인 전체 접근
create policy "catches_select_own" on public.catches for select using (auth.uid() = user_id);
create policy "catches_insert_own" on public.catches for insert with check (auth.uid() = user_id);
create policy "catches_update_own" on public.catches for update using (auth.uid() = user_id);
create policy "catches_delete_own" on public.catches for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Storage : UGC 사진 버킷 (비공개, 사용자별 폴더)
-- 경로 규칙: {user_id}/{catch_id}.jpg
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('catch-photos', 'catch-photos', false)
on conflict (id) do nothing;

create policy "catch_photos_insert_own"
on storage.objects for insert
with check (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "catch_photos_select_own"
on storage.objects for select
using (bucket_id = 'catch-photos' and (storage.foldername(name))[1] = auth.uid()::text);
-- seed.sql — 도감 종 데이터 (MVP 흔한 새 + 시즌/희귀 15종)
-- ⚠️ 시작 종 범위는 TODO Phase 0 결정 항목. 아래는 큐레이션 예시.
insert into public.species (name_ko, name_en, scientific_name, rarity, habitat, sensitive_flag, season, description) values
  ('참새',             'Eurasian Tree Sparrow',      'Passer montanus',        'common',   '도심·농경지', false, '사계절',        '도시와 마을 어디서나 흔히 보이는 친근한 텃새. 흰 뺨의 검은 점이 특징입니다.'),
  ('직박구리',         'Brown-eared Bulbul',         'Hypsipetes amaurotis',   'common',   '도심·산지',   false, '사계절',        '시끄러운 울음소리로 존재감을 드러내는 회갈색 텃새입니다.'),
  ('박새',             'Japanese Tit',               'Parus minor',            'common',   '공원·숲',     false, '사계절',        '검은 넥타이 무늬가 인상적인 작고 활발한 새입니다.'),
  ('멧비둘기',         'Oriental Turtle Dove',       'Streptopelia orientalis','common',   '도심·농경지', false, '사계절',        '목덜미의 비늘무늬가 특징인 토종 비둘기입니다.'),
  ('까치',             'Oriental Magpie',            'Pica serica',            'common',   '도심·마을',   false, '사계절',        '검고 흰 깃과 긴 꼬리를 가진 영리한 새입니다.'),
  ('붉은머리오목눈이', 'Vinous-throated Parrotbill', 'Sinosuthora webbiana',   'common',   '덤불·갈대밭', false, '사계절',        '"뱁새"라 불리는 작은 새로, 무리 지어 다닙니다.'),
  ('딱새',             'Daurian Redstart',           'Phoenicurus auroreus',   'common',   '공원·정원',   false, '사계절',        '주황빛 배와 꼬리를 떠는 행동이 귀여운 새입니다.'),
  ('곤줄박이',         'Varied Tit',                 'Sittiparus varius',      'common',   '숲·공원',     false, '사계절',        '주황색 배와 검은 머리가 대비되는 박새과 새입니다.'),
  ('동박새',           'Warbling White-eye',         'Zosterops japonicus',    'common',   '숲·정원',     false, '사계절',        '눈 둘레의 흰 테가 특징인 연두빛 작은 새입니다.'),
  ('청둥오리',         'Mallard',                    'Anas platyrhynchos',     'seasonal', '하천·호수',   false, '겨울 (10~3월)', '수컷의 광택 나는 초록 머리가 인상적인 겨울 철새입니다.'),
  ('쇠오리',           'Eurasian Teal',              'Anas crecca',            'seasonal', '하천·습지',   false, '겨울 (10~3월)', '가장 작은 오리류 중 하나인 겨울 철새입니다.'),
  ('큰기러기',         'Tundra Bean Goose',          'Anser fabalis',          'seasonal', '농경지·호수', false, '겨울 (10~2월)', 'V자 대형으로 날아가는 대형 겨울 철새입니다.'),
  ('물총새',           'Common Kingfisher',          'Alcedo atthis',          'uncommon','하천·계곡',   false, '여름',          '보석처럼 빛나는 청록색 깃을 가진 물가의 사냥꾼입니다.'),
  ('황조롱이',         'Common Kestrel',             'Falco tinnunculus',      'uncommon','도심·절벽',   false, '사계절',        '공중에서 정지 비행하며 사냥하는 도심의 맹금류입니다.'),
  ('원앙',             'Mandarin Duck',              'Aix galericulata',       'uncommon','계곡·호수',   false, '사계절',        '화려한 색의 수컷으로 유명한 천연기념물 오리입니다.');
