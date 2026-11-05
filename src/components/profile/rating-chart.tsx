import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const WIDTH = 340;
const HEIGHT = 130;
const BASELINE = 122;
const POINTS = [
  [10, 115],
  [90, 89],
  [170, 76],
  [250, 62],
  [330, 10],
] as const;
/** Ponto destacado com "?": o rating que o jogador ainda não definiu. */
const HIGHLIGHT = POINTS[3];
const GRID_LINES = [20, 42, 64, 86, 108];

const linePath = POINTS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
const areaPath = `${linePath} L${POINTS[POINTS.length - 1][0]} ${BASELINE} L${POINTS[0][0]} ${BASELINE} Z`;

/** Ilustração do gráfico de evolução do rating, exibida enquanto o jogador não tem rating. */
export function RatingChart() {
  return (
    <Svg width="100%" height={110} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs>
        <LinearGradient id="area" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0.35" stopColor={Colors.primary} stopOpacity="0" />
          <Stop offset="1" stopColor={Colors.primary} stopOpacity="0.55" />
        </LinearGradient>
      </Defs>

      {GRID_LINES.map((y) => (
        <Line
          key={y}
          x1={0}
          x2={WIDTH}
          y1={y}
          y2={y}
          stroke={Colors.border}
          strokeDasharray="6 6"
        />
      ))}

      <Path d={areaPath} fill="url(#area)" />
      <Path d={linePath} stroke={Colors.primary} strokeWidth={3} fill="none" />

      <Line
        x1={HIGHLIGHT[0]}
        x2={HIGHLIGHT[0]}
        y1={0}
        y2={HEIGHT}
        stroke={Colors.primary}
        strokeWidth={2}
        strokeDasharray="5 5"
      />

      {POINTS.filter((point) => point !== HIGHLIGHT).map(([x, y]) => (
        <Circle key={x} cx={x} cy={y} r={6} fill={Colors.primary} />
      ))}

      <Circle cx={HIGHLIGHT[0]} cy={HIGHLIGHT[1]} r={30} fill={Colors.primary} opacity={0.18} />
      <Circle cx={HIGHLIGHT[0]} cy={HIGHLIGHT[1]} r={20} fill={Colors.primary} />
      <Text
        x={HIGHLIGHT[0]}
        y={HIGHLIGHT[1] + 7}
        fill={Colors.onPrimary}
        fontSize={20}
        fontWeight="bold"
        textAnchor="middle">
        ?
      </Text>
    </Svg>
  );
}
