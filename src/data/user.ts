import type { PreferenceKey } from '@/constants/sport-preferences';
import type { Sport } from '@/constants/sports';

// Dados de exemplo até existir um backend.

/** Ponto do histórico de rating: o nivelamento ou o resultado de uma partida. */
export type RatingEntry = {
  date: string;
  rating: number;
  label: string;
  matchId?: string;
};

export type User = {
  id: string;
  name: string;
  /** URL da foto de perfil; `null` mostra as iniciais. */
  photoUri: string | null;
  /** Cidade exibida no perfil, ex.: "São Paulo, SP"; `null` = não informada. */
  location: string | null;
  /** Saldo da moeda virtual do app. */
  playnetCoins: number;
  /** Títulos comprados na Loja (ids de STORE_TITLES). */
  ownedTitles: string[];
  /** Banners comprados na Loja (ids de STORE_BANNERS). */
  ownedBanners: string[];
  /** Título exibido no perfil; `null` = nenhum. */
  currentTitle: string | null;
  /** Banner de fundo do perfil; `null` = fundo padrão. */
  currentBanner: string | null;
  /** Rating em cada esporte; ausente = nivelamento ainda não feito. */
  ratings: Partial<Record<Sport, number>>;
  /** Histórico do rating em cada esporte, do mais antigo ao mais recente. */
  ratingHistory: Partial<Record<Sport, RatingEntry[]>>;
  /** Preferências de jogador em cada esporte (opções de SPORT_PREFERENCES). */
  preferences: Partial<Record<Sport, Partial<Record<PreferenceKey, string>>>>;
  games: number;
  followers: number;
  /** Ids (PLAYERS) dos jogadores que o usuário segue. */
  followingIds: string[];
};

export const MOCK_USER: User = {
  id: 'me',
  name: 'João Vitor Figueiredo',
  photoUri: null,
  location: null,
  playnetCoins: 1250,
  // Contas novas começam sem título e sem banner.
  ownedTitles: [],
  ownedBanners: [],
  currentTitle: null,
  currentBanner: null,
  ratings: {},
  ratingHistory: {},
  preferences: {},
  games: 0,
  followers: 0,
  followingIds: ['mariana-costa'],
};
