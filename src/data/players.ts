import type { Sport } from '@/constants/sports';

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

// Torneios ainda não têm tabela no banco; os jogadores reais vêm de lib/perfis.
export const PLAYERS: Player[] = [];

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
