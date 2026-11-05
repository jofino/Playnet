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

/** Id de cada esporte no banco (tabela `esportes`). Único lugar que traduz entre o id e o nome. */
export const SPORT_IDS = {
  Tênis: 'tenis',
  'Beach Tennis': 'beach-tennis',
  Futevôlei: 'futevolei',
  'Vôlei de Praia': 'volei-de-praia',
  Padel: 'padel',
  'Tênis de Mesa': 'tenis-de-mesa',
} as const satisfies Record<Sport, string>;

export type SportId = (typeof SPORT_IDS)[Sport];

/** Nome do esporte; `undefined` para um id que esta versão do app ainda não conhece. */
export function sportFromId(id: string): Sport | undefined {
  return SUPPORTED_SPORTS.find((sport) => SPORT_IDS[sport] === id);
}

// O ícone de cada esporte fica em components/sport-icon.tsx.
