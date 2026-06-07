import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

/**
 * 참새(Eurasian Tree Sparrow) 플랫 일러스트.
 * 시그니처: 밤색 머리 + 흰 뺨 + 검은 뺨점 + 검은 턱.
 * 색은 자연색 고정(브랜드 틴트와 분리). 좌측을 바라보는 포즈.
 */
export function Sparrow({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* 꼬리 */}
      <Path d="M42 34 L62 26 L61 42 Z" fill="#6E4E2A" />
      {/* 몸통 */}
      <Ellipse cx={32} cy={38} rx={18} ry={16} fill="#A8804E" />
      {/* 배(밝은 면) */}
      <Ellipse cx={28} cy={43} rx={11} ry={10} fill="#F0E2CA" />
      {/* 날개 */}
      <Path d="M30 27 C42 26 51 33 47 44 C41 40 35 36 30 33 Z" fill="#87613A" />
      {/* 날개 줄무늬(윙바) */}
      <Path d="M33 33 C38 34 43 37 46 41" stroke="#EFE2CA" strokeWidth={1.6} strokeLinecap="round" />
      {/* 머리(밤색 정수리) */}
      <Circle cx={21} cy={24} r={12.5} fill="#8A5A2B" />
      {/* 흰 뺨 */}
      <Circle cx={15} cy={28} r={6.2} fill="#FAF5EC" />
      {/* 검은 뺨점(참새 시그니처) */}
      <Circle cx={14} cy={30} r={2} fill="#2E2A26" />
      {/* 검은 턱 */}
      <Ellipse cx={12} cy={33.5} rx={3.4} ry={2.4} fill="#2E2A26" />
      {/* 부리 */}
      <Path d="M11 26 L3 28.5 L11 31 Z" fill="#4A3F33" />
      {/* 눈 */}
      <G>
        <Circle cx={20} cy={23} r={2.1} fill="#211E1B" />
        <Circle cx={20.7} cy={22.3} r={0.7} fill="#FFFFFF" />
      </G>
    </Svg>
  );
}
