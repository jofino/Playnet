import type { Sport } from '@/constants/sports';

// Catálogo de cosméticos vendidos pelo próprio app.

/** Título cosmético que o jogador compra com Playnet Coins e exibe no perfil. */
export type StoreTitle = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Preço em Playnet Coins. */
  price: number;
};

export const STORE_TITLES: StoreTitle[] = [
  {
    id: 'prodigio',
    name: 'Prodígio',
    emoji: '🌟',
    description: 'Para quem está começando e já chama atenção.',
    price: 300,
  },
  {
    id: 'craque',
    name: 'Craque',
    emoji: '🎯',
    description: 'Técnica apurada e jogadas de efeito.',
    price: 500,
  },
  {
    id: 'especialista',
    name: 'Especialista',
    emoji: '🧠',
    description: 'Domina o jogo e lê cada ponto.',
    price: 800,
  },
  {
    id: 'perigoso',
    name: 'Perigoso',
    emoji: '🔥',
    description: 'Ninguém quer enfrentar você.',
    price: 1200,
  },
];

/** Banner de fundo do perfil, temático de um esporte (arte em components/profile/profile-banner.tsx). */
export type StoreBanner = {
  id: string;
  name: string;
  sport: Sport;
  description: string;
  /** Preço em Playnet Coins. */
  price: number;
};

export const STORE_BANNERS: StoreBanner[] = [
  {
    id: 'tenis',
    name: 'Saibro',
    sport: 'Tênis',
    description: 'Quadra de saibro com as linhas brancas do tênis.',
    price: 400,
  },
  {
    id: 'beach-tennis',
    name: 'Pé na areia',
    sport: 'Beach Tennis',
    description: 'Areia, mar e sol para os fãs de beach tennis.',
    price: 400,
  },
  {
    id: 'futevolei',
    name: 'Pé na bola',
    sport: 'Futevôlei',
    description: 'Fim de tarde na praia com a bola no ar.',
    price: 450,
  },
  {
    id: 'volei-de-praia',
    name: 'Rede no pôr do sol',
    sport: 'Vôlei de Praia',
    description: 'A rede do vôlei de praia contra o céu alaranjado.',
    price: 450,
  },
  {
    id: 'padel',
    name: 'Paredes de vidro',
    sport: 'Padel',
    description: 'Quadra azul de padel com as paredes de vidro.',
    price: 400,
  },
  {
    id: 'tenis-de-mesa',
    name: 'Mesa azul',
    sport: 'Tênis de Mesa',
    description: 'A mesa vista de cima, com rede, raquete e bolinha.',
    price: 400,
  },
];
