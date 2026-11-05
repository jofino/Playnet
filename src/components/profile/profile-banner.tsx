import { useId, type ComponentType } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const WIDTH = 400;
const HEIGHT = 140;

type ProfileBannerProps = {
  /** Id de STORE_BANNERS; `null` mostra o fundo padrão. */
  bannerId: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Fundo do topo do perfil. Ilustrações provisórias em SVG, uma por esporte. */
export function ProfileBanner({ bannerId, style }: ProfileBannerProps) {
  // Na web, ids de gradiente repetidos na página apontam para o primeiro SVG — que pode estar
  // numa aba escondida e não ser desenhado. Por isso cada banner usa ids próprios.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const Art = (bannerId && BANNER_ART[bannerId]) || DefaultArt;

  return (
    <View style={[styles.banner, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice">
        <Art uid={uid} />
      </Svg>
    </View>
  );
}

type ArtProps = { uid: string };

function Gradient({ id, from, to, vertical = true }: { id: string; from: string; to: string; vertical?: boolean }) {
  return (
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '1'}>
        <Stop offset="0" stopColor={from} />
        <Stop offset="1" stopColor={to} />
      </LinearGradient>
    </Defs>
  );
}

function DefaultArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-default-bg`} from="#ECECEF" to="#D9D9DE" vertical={false} />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-default-bg)`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Path key={i} d={`M${i * 90 - 60} ${HEIGHT} L${i * 90 + 20} 0`} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={18} />
      ))}
    </>
  );
}

function TennisArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-tenis-bg`} from="#D0603F" to="#A8432F" />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-tenis-bg)`} />
      <Rect x={40} y={20} width={320} height={100} stroke="#FFFFFF" strokeWidth={3} fill="none" />
      <Line x1={40} y1={34} x2={360} y2={34} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={40} y1={106} x2={360} y2={106} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={120} y1={34} x2={120} y2={106} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={280} y1={34} x2={280} y2={106} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={120} y1={70} x2={280} y2={70} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={200} y1={12} x2={200} y2={128} stroke="#3B1D14" strokeWidth={4} strokeDasharray="4 3" />
      <Circle cx={300} cy={52} r={9} fill="#D9F24A" />
      <Path d="M293 46 Q300 52 293 58 M307 46 Q300 52 307 58" stroke="#FFFFFF" strokeWidth={1.5} fill="none" />
    </>
  );
}

function BeachTennisArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-beach-tennis-sky`} from="#7CC6FE" to="#CDEBFF" />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-beach-tennis-sky)`} />
      <Circle cx={330} cy={38} r={22} fill="#FFD166" />
      <Rect y={72} width={WIDTH} height={24} fill="#2E86C1" />
      <Path d="M0 80 Q25 74 50 80 T100 80 T150 80 T200 80 T250 80 T300 80 T350 80 T400 80" stroke="#FFFFFF" strokeWidth={2} fill="none" />
      <Path d="M0 96 Q100 88 200 96 T400 94 L400 140 L0 140 Z" fill="#F2D49B" />
      <Line x1={60} y1={78} x2={60} y2={128} stroke="#6B4F2A" strokeWidth={3} />
      <Line x1={150} y1={78} x2={150} y2={128} stroke="#6B4F2A" strokeWidth={3} />
      <Rect x={60} y={82} width={90} height={14} fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
      <Circle cx={230} cy={58} r={8} fill="#FF8C42" />
    </>
  );
}

function FutevoleiArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-futevolei-sky`} from="#FF9A5A" to="#FFD49A" />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-futevolei-sky)`} />
      <Path d="M0 98 Q120 86 240 96 T400 92 L400 140 L0 140 Z" fill="#E9C38A" />
      <Path d="M210 104 Q260 30 296 56" stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={2} strokeDasharray="5 5" fill="none" />
      <Circle cx={304} cy={58} r={16} fill="#FFFFFF" stroke="#1E1E1E" strokeWidth={1.5} />
      <Path d="M304 50 L311 55 L308 63 L300 63 L297 55 Z" fill="#1E1E1E" />
      <Path d="M304 42 L304 50 M311 55 L319 52 M308 63 L313 70 M300 63 L295 70 M297 55 L289 52" stroke="#1E1E1E" strokeWidth={1.2} />
      <Line x1={40} y1={70} x2={40} y2={126} stroke="#5A3B1C" strokeWidth={3} />
      <Line x1={150} y1={70} x2={150} y2={126} stroke="#5A3B1C" strokeWidth={3} />
      <Line x1={40} y1={74} x2={150} y2={74} stroke="#FFFFFF" strokeWidth={3} />
    </>
  );
}

function VoleiDePraiaArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-volei-de-praia-sky`} from="#F25C3B" to="#FDB25E" />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-volei-de-praia-sky)`} />
      <Circle cx={200} cy={92} r={34} fill="#FFE29A" />
      <Rect y={88} width={WIDTH} height={14} fill="#5B3A8C" opacity={0.85} />
      <Path d="M0 104 Q200 96 400 104 L400 140 L0 140 Z" fill="#E8B77A" />
      <Line x1={70} y1={40} x2={70} y2={128} stroke="#2B1B3D" strokeWidth={4} />
      <Line x1={330} y1={40} x2={330} y2={128} stroke="#2B1B3D" strokeWidth={4} />
      <Rect x={70} y={44} width={260} height={26} fill="#2B1B3D" opacity={0.25} />
      <Line x1={70} y1={44} x2={330} y2={44} stroke="#FFFFFF" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => (
        <Line key={i} x1={70 + (i + 1) * 20} y1={44} x2={70 + (i + 1) * 20} y2={70} stroke="#2B1B3D" strokeWidth={1} />
      ))}
      <Line x1={70} y1={57} x2={330} y2={57} stroke="#2B1B3D" strokeWidth={1} />
      <Circle cx={260} cy={24} r={11} fill="#FFFFFF" stroke="#F2C14E" strokeWidth={2} />
      <Path d="M251 20 Q260 26 269 20 M256 14 Q262 24 258 34" stroke="#2E86C1" strokeWidth={1.5} fill="none" />
    </>
  );
}

function PadelArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-padel-bg`} from="#2A86D1" to="#1B5E9A" />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-padel-bg)`} />
      <Rect x={10} y={12} width={50} height={116} fill="#FFFFFF" opacity={0.18} />
      <Rect x={340} y={12} width={50} height={116} fill="#FFFFFF" opacity={0.18} />
      {[30, 50, 70, 90, 110].map((y) => (
        <Line key={y} x1={10} y1={y} x2={60} y2={y} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1} />
      ))}
      {[30, 50, 70, 90, 110].map((y) => (
        <Line key={y} x1={340} y1={y} x2={390} y2={y} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1} />
      ))}
      <Rect x={60} y={12} width={280} height={116} stroke="#FFFFFF" strokeWidth={3} fill="none" />
      <Line x1={200} y1={8} x2={200} y2={132} stroke="#0D2F4F" strokeWidth={4} />
      <Line x1={120} y1={12} x2={120} y2={128} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={280} y1={12} x2={280} y2={128} stroke="#FFFFFF" strokeWidth={2} />
      <Line x1={120} y1={70} x2={280} y2={70} stroke="#FFFFFF" strokeWidth={2} />
      <Circle cx={240} cy={44} r={8} fill="#E8F542" />
    </>
  );
}

function TenisDeMesaArt({ uid }: ArtProps) {
  return (
    <>
      <Gradient id={`${uid}-tenis-de-mesa-bg`} from="#26324F" to="#141B2E" />
      <Rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-tenis-de-mesa-bg)`} />
      <Rect x={70} y={22} width={260} height={96} rx={4} fill="#1565C0" stroke="#FFFFFF" strokeWidth={3} />
      <Line x1={70} y1={70} x2={330} y2={70} stroke="#FFFFFF" strokeWidth={1.5} />
      <Line x1={200} y1={14} x2={200} y2={126} stroke="#0B1530" strokeWidth={5} />
      <Line x1={200} y1={14} x2={200} y2={126} stroke="#FFFFFF" strokeWidth={1.2} strokeDasharray="3 3" />
      <Line x1={322} y1={104} x2={344} y2={128} stroke="#8B5A2B" strokeWidth={6} strokeLinecap="round" />
      <Circle cx={316} cy={96} r={16} fill="#D7263D" />
      <Circle cx={150} cy={46} r={5} fill="#FFFFFF" />
      <Path d="M128 58 Q140 44 146 47" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
    </>
  );
}

const BANNER_ART: Record<string, ComponentType<ArtProps>> = {
  tenis: TennisArt,
  'beach-tennis': BeachTennisArt,
  futevolei: FutevoleiArt,
  'volei-de-praia': VoleiDePraiaArt,
  padel: PadelArt,
  'tenis-de-mesa': TenisDeMesaArt,
};

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
    backgroundColor: '#E4E4E7',
  },
});
