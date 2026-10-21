import type { Sport } from '@/constants/sports';

// Dados de exemplo até existir um backend.

export const USER_REGION = 'São Paulo, SP';

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

export const VENUES: Venue[] = [
  { id: 'santana', name: 'Centro Esportivo Santana', neighborhood: 'Santana', sports: ['Tênis', 'Tênis de Mesa'], x: 0.58, y: 0.14 },
  { id: 'tatuape', name: 'Quadras de Areia Tatuapé', neighborhood: 'Tatuapé', sports: ['Vôlei de Praia', 'Beach Tennis', 'Futevôlei'], x: 0.85, y: 0.38 },
  { id: 'pinheiros', name: 'Clube Pinheiros', neighborhood: 'Pinheiros', sports: ['Tênis', 'Padel'], x: 0.27, y: 0.45 },
  { id: 'ibirapuera', name: 'Arena Ibirapuera', neighborhood: 'Moema', sports: ['Tênis', 'Padel'], x: 0.55, y: 0.6 },
  { id: 'vila-olimpia', name: 'Beach Club Vila Olímpia', neighborhood: 'Vila Olímpia', sports: ['Beach Tennis', 'Futevôlei', 'Vôlei de Praia'], x: 0.4, y: 0.74 },
  { id: 'morumbi', name: 'Padel Morumbi', neighborhood: 'Morumbi', sports: ['Padel'], x: 0.14, y: 0.82 },
  { id: 'lapa', name: 'Arena Lapa', neighborhood: 'Lapa', sports: ['Padel', 'Tênis'], x: 0.18, y: 0.22 },
  { id: 'liberdade', name: 'Clube de Tênis de Mesa Liberdade', neighborhood: 'Liberdade', sports: ['Tênis de Mesa'], x: 0.64, y: 0.42 },
  { id: 'mooca', name: 'Areia Mooca', neighborhood: 'Mooca', sports: ['Beach Tennis', 'Futevôlei', 'Vôlei de Praia'], x: 0.74, y: 0.62 },
];

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
