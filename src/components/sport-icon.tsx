import type { ComponentType } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import type { Sport } from '@/constants/sports';

type SportIconProps = {
  sport: Sport;
  size?: number;
};

/**
 * Ícone desenhado de cada esporte (24×24). Feito em SVG porque não existem emojis
 * próprios para padel e beach tennis — e o 🏓 é de tênis de mesa.
 */
export function SportIcon({ sport, size = 18 }: SportIconProps) {
  const Art = SPORT_ART[sport];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Art />
    </Svg>
  );
}

/** Bolinha verde-amarela com as costuras. */
function TennisArt() {
  return (
    <>
      <Circle cx={12} cy={12} r={10} fill="#C9E83A" />
      <Path d="M4.6 5.4 C 8.6 8.6, 8.6 15.4, 4.6 18.6" stroke="#FFFFFF" strokeWidth={1.8} fill="none" />
      <Path d="M19.4 5.4 C 15.4 8.6, 15.4 15.4, 19.4 18.6" stroke="#FFFFFF" strokeWidth={1.8} fill="none" />
    </>
  );
}

/** Raquete de beach tennis (sem cordas) diante do sol. */
function BeachTennisArt() {
  return (
    <>
      <Circle cx={17} cy={7} r={5.5} fill="#FDB813" />
      <G transform="rotate(-35 10 12)">
        <Rect x={4.5} y={2.5} width={11} height={12.5} rx={5.5} fill="#16A3A3" />
        <Rect x={8.7} y={14} width={2.6} height={8} rx={1.2} fill="#0E5E5E" />
        <Circle cx={8} cy={7.5} r={0.9} fill="#FFFFFF" />
        <Circle cx={12} cy={7.5} r={0.9} fill="#FFFFFF" />
        <Circle cx={10} cy={10.5} r={0.9} fill="#FFFFFF" />
      </G>
    </>
  );
}

/** Bola de futebol: pentágono central, gomos na borda e costuras. */
function FutevoleiArt() {
  return (
    <>
      <Circle cx={12} cy={12} r={10} fill="#FFFFFF" />
      <Path d={BALL_CENTER} fill="#1E1E1E" />
      {BALL_EDGE_PATCHES.map((d) => (
        <Path key={d} d={d} fill="#1E1E1E" />
      ))}
      <Path d={BALL_SEAMS} stroke="#1E1E1E" strokeWidth={1.1} />
      <Circle cx={12} cy={12} r={10} fill="none" stroke="#1E1E1E" strokeWidth={1.3} />
    </>
  );
}

// Geometria da bola, em graus a partir do centro (12, 12).
const polar = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180;
  return `${(12 + radius * Math.cos(rad)).toFixed(2)} ${(12 + radius * Math.sin(rad)).toFixed(2)}`;
};
const PENTAGON_ANGLES = [-90, -18, 54, 126, 198];
const BALL_CENTER = `M${PENTAGON_ANGLES.map((a) => polar(a, 3.8)).join(' L')} Z`;
const BALL_EDGE_PATCHES = PENTAGON_ANGLES.map(
  (a) => `M${polar(a + 36 - 16, 10)} L${polar(a + 36 + 16, 10)} L${polar(a + 36, 7.2)} Z`
);
const BALL_SEAMS = PENTAGON_ANGLES.map((a) => `M${polar(a, 3.8)} L${polar(a, 10)}`).join(' ');

/** Bola de vôlei amarela e azul. */
function VoleiDePraiaArt() {
  return (
    <>
      <Circle cx={12} cy={12} r={10} fill="#FFD23F" />
      <Path d="M12 2 C 8 7, 8.5 13, 12 12 C 15 11, 18 14, 21.4 15.4 A 10 10 0 0 0 12 2 Z" fill="#1E6FD9" />
      <Path d="M12 12 C 9.5 15.5, 6 17, 3 16.2 A 10 10 0 0 0 12 22 C 12.5 18, 12.5 14.5, 12 12 Z" fill="#1E6FD9" />
      <Circle cx={12} cy={12} r={10} fill="none" stroke="#1B4F9C" strokeWidth={1.2} />
    </>
  );
}

/** Raquete de padel: cabeça alongada e furada, cabo curto, bolinha amarela. */
function PadelArt() {
  return (
    <>
      <G transform="rotate(-25 11 12)">
        <Rect x={5} y={1.5} width={12} height={14} rx={5.5} fill="#1B3A6B" />
        <Rect x={9.6} y={15} width={2.8} height={7.5} rx={1.2} fill="#3C3C3C" />
        {[
          [8.5, 5.5],
          [11, 5.5],
          [13.5, 5.5],
          [8.5, 8.5],
          [11, 8.5],
          [13.5, 8.5],
          [11, 11.5],
        ].map(([cx, cy]) => (
          <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={0.85} fill="#FFFFFF" />
        ))}
      </G>
      <Circle cx={19.5} cy={19} r={3} fill="#E3F23A" stroke="#B5C21E" strokeWidth={0.6} />
    </>
  );
}

/** Raquete de tênis de mesa vermelha, redonda, com a bolinha branca. */
function TenisDeMesaArt() {
  return (
    <>
      <G transform="rotate(-40 10 11)">
        <Rect x={8.6} y={14} width={2.8} height={8} rx={1.2} fill="#8B5A2B" />
        <Circle cx={10} cy={9} r={7.5} fill="#D7263D" />
      </G>
      <Circle cx={19.5} cy={5} r={3} fill="#FFFFFF" stroke="#C9C9C9" strokeWidth={0.8} />
    </>
  );
}

const SPORT_ART: Record<Sport, ComponentType> = {
  Tênis: TennisArt,
  'Beach Tennis': BeachTennisArt,
  Futevôlei: FutevoleiArt,
  'Vôlei de Praia': VoleiDePraiaArt,
  Padel: PadelArt,
  'Tênis de Mesa': TenisDeMesaArt,
};
