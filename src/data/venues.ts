import type { Sport } from '@/constants/sports';

/** Locais onde acontecem partidas e aulas. */
export type Venue = {
  id: string;
  name: string;
  neighborhood: string;
  /** Esportes que o local oferece (quadras de areia, de saibro, de padel...). */
  sports: Sport[];
  /** Posição no mapa ilustrativo, de 0 a 1 (esquerda→direita, topo→base). */
  x: number;
  y: number;
};

// Os locais ainda não têm tabela no banco; nas partidas, o local é digitado por quem cria.
export const VENUES: Venue[] = [];

/** Posição do usuário no mapa ilustrativo (mesma escala dos locais). */
export const USER_LOCATION = { x: 0.48, y: 0.5 };

// Escala do mapa ilustrativo: largura ≈ 20 km e altura ≈ 14 km.
const MAP_WIDTH_KM = 20;
const MAP_HEIGHT_KM = 14;

export function getVenue(id: string) {
  return VENUES.find((venue) => venue.id === id);
}

/** Distância em linha reta do usuário até o local, em km. */
export function distanceFromUserKm(venue: Venue) {
  const dx = (venue.x - USER_LOCATION.x) * MAP_WIDTH_KM;
  const dy = (venue.y - USER_LOCATION.y) * MAP_HEIGHT_KM;
  return Math.hypot(dx, dy);
}
