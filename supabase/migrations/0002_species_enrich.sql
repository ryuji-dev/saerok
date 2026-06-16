-- 0002_species_enrich.sql
-- 기존 DB(0001 적용 + 8종 시드)에 적용: season 컬럼 추가 + 15종으로 재시드.
-- catches가 species를 참조하지만 아직 데이터가 없으므로 delete 안전.

alter table public.species add column if not exists season text;

delete from public.species;
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
  ('황조롱이',         'Common Kestrel',             'Falco tinnunculus',      'uncommon',     '도심·절벽',   false, '사계절',        '공중에서 정지 비행하며 사냥하는 도심의 맹금류입니다.'),
  ('원앙',             'Mandarin Duck',              'Aix galericulata',       'uncommon','계곡·호수',   false, '사계절',        '화려한 색의 수컷으로 유명한 천연기념물 오리입니다.');
