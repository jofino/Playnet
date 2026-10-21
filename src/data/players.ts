import type { Sport } from '@/constants/sports';
import { RANKED_PLAYERS, type StateCode } from '@/data/ranking';

// Dados de exemplo até existir um backend: os jogadores do ranking viram perfis navegáveis.

/** Nome usado para o usuário logado em partidas, torneios e posts. */
export const ME = 'Você';

export type Player = {
  id: string;
  name: string;
  location: string;
  bio: string;
  /** Rating em cada esporte que o jogador pratica. */
  ratings: Partial<Record<Sport, number>>;
  followers: number;
  following: number;
  /** Banner de fundo do perfil (id de STORE_BANNERS). */
  bannerId: string | null;
};

/** Id estável a partir do nome, ex.: "João Pedro Lacerda" → "joao-pedro-lacerda". */
export function playerIdFromName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

// Número "aleatório" estável derivado do nome, para seguidores de exemplo.
function seed(name: string) {
  return [...name].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

const BANNER_BY_SPORT: Record<Sport, string> = {
  Tênis: 'tenis',
  'Beach Tennis': 'beach-tennis',
  Futevôlei: 'futevolei',
  'Vôlei de Praia': 'volei-de-praia',
  Padel: 'padel',
  'Tênis de Mesa': 'tenis-de-mesa',
};

function buildPlayers(): Player[] {
  const byName = new Map<string, { city: string; state: StateCode; ratings: Partial<Record<Sport, number>> }>();
  for (const row of RANKED_PLAYERS) {
    const entry = byName.get(row.name) ?? { city: row.city, state: row.state, ratings: {} };
    entry.ratings[row.sport] = row.rating;
    byName.set(row.name, entry);
  }
  return [...byName].map(([name, { city, state, ratings }]) => {
    const sports = Object.keys(ratings) as Sport[];
    const n = seed(name);
    return {
      id: playerIdFromName(name),
      name,
      location: `${city}, ${state}`,
      bio: `Joga ${sports.join(' e ')} em ${city}. Sempre procurando um bom jogo!`,
      ratings,
      followers: 20 + (n % 380),
      following: 10 + (n % 150),
      bannerId: n % 3 === 0 ? null : BANNER_BY_SPORT[sports[0]],
    };
  });
}

export const PLAYERS: Player[] = buildPlayers();

export function getPlayer(id: string) {
  return PLAYERS.find((player) => player.id === id);
}

export function getPlayerByName(name: string) {
  return PLAYERS.find((player) => player.name === name);
}

/** Rating de um jogador no esporte; quem não tem rating conta como intermediário (1000). */
export function ratingOf(name: string, sport: Sport) {
  return getPlayerByName(name)?.ratings[sport] ?? 1000;
}
