// 목업 새 데이터 — Supabase 연동 시 교체.
export type Rarity = 'common' | 'seasonal' | 'rare';

export type MockBird = {
  id: string;
  name: string;
  nameEn: string;
  scientificName: string;
  rarity: Rarity;
  habitat: string;
  season: string;
  collected: boolean;
  /** 홈 "최근 등록한 새"에서 보여줄 등록 시점 라벨. */
  caption?: string;
  description: string;
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '흔함',
  seasonal: '시즌',
  rare: '드묾',
};

export const MOCK_BIRDS: MockBird[] = [
  { id: 'chamsae', name: '참새', nameEn: 'Eurasian Tree Sparrow', scientificName: 'Passer montanus', rarity: 'common', habitat: '도심·농경지', season: '사계절', collected: true, caption: '오늘', description: '도시와 마을 어디서나 흔히 보이는 친근한 텃새. 흰 뺨의 검은 점이 특징입니다.' },
  { id: 'jikbaguri', name: '직박구리', nameEn: 'Brown-eared Bulbul', scientificName: 'Hypsipetes amaurotis', rarity: 'common', habitat: '도심·산지', season: '사계절', collected: true, caption: '어제', description: '시끄러운 울음소리로 존재감을 드러내는 회갈색 텃새입니다.' },
  { id: 'baksae', name: '박새', nameEn: 'Japanese Tit', scientificName: 'Parus minor', rarity: 'common', habitat: '공원·숲', season: '사계절', collected: true, caption: '3일 전', description: '검은 넥타이 무늬가 인상적인 작고 활발한 새입니다.' },
  { id: 'metbeedulgi', name: '멧비둘기', nameEn: 'Oriental Turtle Dove', scientificName: 'Streptopelia orientalis', rarity: 'common', habitat: '도심·농경지', season: '사계절', collected: true, caption: '5일 전', description: '목덜미의 비늘무늬가 특징인 토종 비둘기입니다.' },
  { id: 'kkachi', name: '까치', nameEn: 'Oriental Magpie', scientificName: 'Pica serica', rarity: 'common', habitat: '도심·마을', season: '사계절', collected: true, caption: '1주 전', description: '검고 흰 깃과 긴 꼬리를 가진 영리한 새입니다.' },
  { id: 'bbaepsae', name: '붉은머리오목눈이', nameEn: 'Vinous-throated Parrotbill', scientificName: 'Sinosuthora webbiana', rarity: 'common', habitat: '덤불·갈대밭', season: '사계절', collected: true, caption: '1주 전', description: '"뱁새"라 불리는 작은 새로, 무리 지어 다닙니다.' },
  { id: 'ttaksae', name: '딱새', nameEn: 'Daurian Redstart', scientificName: 'Phoenicurus auroreus', rarity: 'common', habitat: '공원·정원', season: '사계절', collected: false, description: '주황빛 배와 꼬리를 떠는 행동이 귀여운 새입니다.' },
  { id: 'gonjulbagi', name: '곤줄박이', nameEn: 'Varied Tit', scientificName: 'Sittiparus varius', rarity: 'common', habitat: '숲·공원', season: '사계절', collected: false, description: '주황색 배와 검은 머리가 대비되는 박새과 새입니다.' },
  { id: 'dongbaksae', name: '동박새', nameEn: 'Warbling White-eye', scientificName: 'Zosterops japonicus', rarity: 'common', habitat: '숲·정원', season: '사계절', collected: false, description: '눈 둘레의 흰 테가 특징인 연두빛 작은 새입니다.' },
  { id: 'cheongdung', name: '청둥오리', nameEn: 'Mallard', scientificName: 'Anas platyrhynchos', rarity: 'seasonal', habitat: '하천·호수', season: '겨울 (10~3월)', collected: false, description: '수컷의 광택 나는 초록 머리가 인상적인 겨울 철새입니다.' },
  { id: 'soeori', name: '쇠오리', nameEn: 'Eurasian Teal', scientificName: 'Anas crecca', rarity: 'seasonal', habitat: '하천·습지', season: '겨울 (10~3월)', collected: false, description: '가장 작은 오리류 중 하나인 겨울 철새입니다.' },
  { id: 'keungireogi', name: '큰기러기', nameEn: 'Tundra Bean Goose', scientificName: 'Anser fabalis', rarity: 'seasonal', habitat: '농경지·호수', season: '겨울 (10~2월)', collected: false, description: 'V자 대형으로 날아가는 대형 겨울 철새입니다.' },
  { id: 'mulchongsae', name: '물총새', nameEn: 'Common Kingfisher', scientificName: 'Alcedo atthis', rarity: 'rare', habitat: '하천·계곡', season: '여름', collected: false, description: '보석처럼 빛나는 청록색 깃을 가진 물가의 사냥꾼입니다.' },
  { id: 'hwangjorong', name: '황조롱이', nameEn: 'Common Kestrel', scientificName: 'Falco tinnunculus', rarity: 'rare', habitat: '도심·절벽', season: '사계절', collected: false, description: '공중에서 정지 비행하며 사냥하는 도심의 맹금류입니다.' },
  { id: 'wonang', name: '원앙', nameEn: 'Mandarin Duck', scientificName: 'Aix galericulata', rarity: 'rare', habitat: '계곡·호수', season: '사계절', collected: false, description: '화려한 색의 수컷으로 유명한 천연기념물 오리입니다.' },
];

export function getBird(id: string): MockBird | undefined {
  return MOCK_BIRDS.find((b) => b.id === id);
}

/** 홈 "최근 등록한 새" — 수집한 새 중 caption이 있는 것. */
export const RECENT_BIRDS = MOCK_BIRDS.filter((b) => b.collected && b.caption);

/** 홈 "이번 시즌 새" — 아직 못 만난 시즌/희귀 새. */
export const SEASON_BIRDS = MOCK_BIRDS.filter((b) => !b.collected && b.rarity !== 'common');
