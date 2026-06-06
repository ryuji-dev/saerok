-- seed.sql — 도감 스모크 테스트용 '흔한 새' 시드 (예시)
-- ⚠️ 시작 종 범위(흔한 새 20~30종)는 TODO Phase 0 결정 항목. 아래는 임시 예시 8종.
insert into public.species (name_ko, name_en, scientific_name, rarity, habitat, sensitive_flag) values
  ('참새',           'Eurasian Tree Sparrow', 'Passer montanus',       'common',   '도심·농경지', false),
  ('까치',           'Oriental Magpie',       'Pica serica',           'common',   '도심·마을',   false),
  ('직박구리',       'Brown-eared Bulbul',    'Hypsipetes amaurotis',  'common',   '도심·산지',   false),
  ('박새',           'Japanese Tit',          'Parus minor',           'common',   '공원·숲',     false),
  ('멧비둘기',       'Oriental Turtle Dove',  'Streptopelia orientalis','common',  '도심·농경지', false),
  ('붉은머리오목눈이','Vinous-throated Parrotbill','Sinosuthora webbiana','common','덤불·갈대밭', false),
  ('딱새',           'Daurian Redstart',      'Phoenicurus auroreus',  'common',   '공원·정원',   false),
  ('청둥오리',       'Mallard',               'Anas platyrhynchos',    'seasonal', '하천·호수',   false)
on conflict do nothing;
