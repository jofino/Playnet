import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { Colors, Spacing } from '@/constants/theme';
import { USER_LOCATION, USER_REGION, VENUES, type Venue } from '@/data/venues';

/** Pino no mapa. Posição de 0 a 1 (esquerda→direita, topo→base). */
export type MapPin = {
  id: string;
  x: number;
  y: number;
  /** Texto curto dentro do pino (ex.: quantidade). */
  label: string;
  accessibilityLabel: string;
};

/**
 * Agrupa itens por local e cria um pino por local, com a quantidade de itens.
 * Serve para qualquer lista com `venueId` (partidas, professores...).
 */
export function pinsByVenue<T extends { venueId: string }>(
  items: T[],
  describe: (venue: Venue, count: number) => string
): MapPin[] {
  return VENUES.flatMap((venue) => {
    const count = items.filter((item) => item.venueId === venue.id).length;
    return count > 0
      ? [{ id: venue.id, x: venue.x, y: venue.y, label: String(count), accessibilityLabel: describe(venue, count) }]
      : [];
  });
}

type RegionMapProps = {
  pins: MapPin[];
  selectedPinId: string | null;
  onSelectPin: (pinId: string | null) => void;
  /** Mostra a posição do usuário (ponto azul). */
  showUserLocation?: boolean;
};

const PIN_SIZE = 30;
const USER_DOT_SIZE = 16;

/**
 * MOCK de mapa: ilustração da região com pinos tocáveis.
 * Trocar por um mapa real (ex.: react-native-maps) quando a integração for configurada.
 */
export function RegionMap({ pins, selectedPinId, onSelectPin, showUserLocation = false }: RegionMapProps) {
  return (
    <View style={styles.map}>
      <Svg width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="none">
        {/* Parque, rio e avenidas desenhados apenas como referência visual. */}
        <Ellipse cx={58} cy={46} rx={11} ry={7} fill="#CFE5C4" />
        <Path d="M0 30 C 20 26, 30 36, 50 32 S 80 22, 100 28" stroke="#BFD9F2" strokeWidth={3.5} fill="none" />
        <Path d="M0 12 L100 18 M0 52 L100 58 M20 0 L28 70 M70 0 L64 70 M45 0 L42 70" stroke="#FFFFFF" strokeWidth={1.6} fill="none" />
        <Path d="M0 64 L100 4" stroke="#FFFFFF" strokeWidth={2.4} fill="none" />
      </Svg>

      {showUserLocation && (
        <View
          style={[styles.userDot, { left: `${USER_LOCATION.x * 100}%`, top: `${USER_LOCATION.y * 100}%` }]}
          accessible
          accessibilityLabel="Sua localização"
        />
      )}

      {pins.map((pin) => {
        const selected = pin.id === selectedPinId;
        return (
          <Pressable
            key={pin.id}
            onPress={() => onSelectPin(selected ? null : pin.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={pin.accessibilityLabel}
            hitSlop={8}
            style={[
              styles.pin,
              selected && styles.pinSelected,
              { left: `${pin.x * 100}%`, top: `${pin.y * 100}%` },
            ]}>
            <Text style={[styles.pinText, selected && styles.pinTextSelected]}>{pin.label}</Text>
          </Pressable>
        );
      })}

      <View style={styles.caption} pointerEvents="none">
        <Text style={styles.captionText}>Mapa ilustrativo · {USER_REGION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    aspectRatio: 10 / 7,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EEF0EA',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userDot: {
    position: 'absolute',
    width: USER_DOT_SIZE,
    height: USER_DOT_SIZE,
    marginLeft: -USER_DOT_SIZE / 2,
    marginTop: -USER_DOT_SIZE / 2,
    borderRadius: USER_DOT_SIZE / 2,
    backgroundColor: '#2F80ED',
    borderWidth: 3,
    borderColor: Colors.background,
    boxShadow: '0 0 0 6px rgba(47, 128, 237, 0.2)',
  },
  pin: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    marginLeft: -PIN_SIZE / 2,
    marginTop: -PIN_SIZE / 2,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
  },
  pinSelected: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    transform: [{ scale: 1.2 }],
  },
  pinText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: 800,
  },
  pinTextSelected: {
    color: Colors.primary,
  },
  caption: {
    position: 'absolute',
    left: Spacing.two,
    bottom: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  captionText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: 600,
  },
});
