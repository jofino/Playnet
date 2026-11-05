import { useId } from 'react';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import type { RatingEntry } from '@/data/user';

const WIDTH = 340;
const HEIGHT = 150;
const PADDING_X = 24;
const PADDING_TOP = 26;
const PADDING_BOTTOM = 16;

/** Linha da evolução do rating (nivelamento + partidas), com o valor em cada ponto. */
export function RatingHistoryChart({ entries }: { entries: RatingEntry[] }) {
  // Id único: na web, ids de gradiente repetidos entre SVGs se misturam.
  const gradientId = `rating-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const values = entries.map((entry) => entry.rating);
  const min = Math.min(...values) - 20;
  const max = Math.max(...values) + 20;
  const x = (index: number) =>
    entries.length === 1 ? WIDTH / 2 : PADDING_X + (index * (WIDTH - PADDING_X * 2)) / (entries.length - 1);
  const y = (value: number) => PADDING_TOP + ((max - value) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM)) / (max - min);

  const line = entries.map((entry, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(entry.rating)}`).join(' ');
  const area = `${line} L${x(entries.length - 1)} ${HEIGHT} L${x(0)} ${HEIGHT} Z`;

  return (
    <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} accessibilityLabel={`Rating de ${values[0]} para ${values[values.length - 1]}`}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.3" />
          <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {[0.25, 0.5, 0.75].map((fraction) => (
        <Line
          key={fraction}
          x1={0}
          x2={WIDTH}
          y1={PADDING_TOP + fraction * (HEIGHT - PADDING_TOP - PADDING_BOTTOM)}
          y2={PADDING_TOP + fraction * (HEIGHT - PADDING_TOP - PADDING_BOTTOM)}
          stroke={Colors.border}
          strokeDasharray="6 6"
        />
      ))}
      {entries.length > 1 && <Path d={area} fill={`url(#${gradientId})`} />}
      {entries.length > 1 && <Path d={line} stroke={Colors.primary} strokeWidth={3} fill="none" />}
      {entries.map((entry, index) => {
        const last = index === entries.length - 1;
        return [
          <Circle
            key={`p${index}`}
            cx={x(index)}
            cy={y(entry.rating)}
            r={last ? 7 : 5}
            fill={last ? Colors.primary : Colors.background}
            stroke={Colors.primary}
            strokeWidth={2.5}
          />,
          <SvgText
            key={`t${index}`}
            x={x(index)}
            y={y(entry.rating) - 12}
            fill={last ? Colors.primary : Colors.textSecondary}
            fontSize={last ? 13 : 11}
            fontWeight="bold"
            textAnchor="middle">
            {entry.rating}
          </SvgText>,
        ];
      })}
    </Svg>
  );
}
