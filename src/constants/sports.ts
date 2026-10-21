/** Esportes suportados pelo Playnet. Fonte única para filtros, rankings e perfis. */
export const SUPPORTED_SPORTS = [
  'Tênis',
  'Beach Tennis',
  'Futevôlei',
  'Vôlei de Praia',
  'Padel',
  'Tênis de Mesa',
] as const;

export type Sport = (typeof SUPPORTED_SPORTS)[number];

// O ícone de cada esporte fica em components/sport-icon.tsx.
