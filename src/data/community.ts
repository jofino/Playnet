import type { Sport } from '@/constants/sports';
import { hoursAgo } from '@/utils/time';

// Dados de exemplo até existir um backend.

export type Comment = { id: string; author: string; text: string; createdAt: string };

export type Post = {
  id: string;
  author: string;
  createdAt: string;
  text: string;
  sport?: Sport;
  imageUri?: string;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
};

/** Fundos dos stories de texto. */
export const STORY_BACKGROUNDS = ['#E05434', '#1B3A6B', '#16A3A3', '#7B2CBF', '#2B2D42', '#F59E0B'];

export type StoryItem = {
  id: string;
  createdAt: string;
  /** Story de texto (sobre `background`) ou de foto (`imageUri`). */
  text?: string;
  background?: string;
  imageUri?: string;
};

export type StoryGroup = { author: string; items: StoryItem[]; seen: boolean };

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    author: 'Mariana Costa',
    createdAt: hoursAgo(2),
    text: 'Treino de saque hoje cedo no Clube Pinheiros 🎾 Alguém topa um jogo no sábado de manhã?',
    sport: 'Tênis',
    likes: 24,
    likedByMe: false,
    comments: [
      { id: 'c1', author: 'Lucas Andrade', text: 'Topo! 9h?', createdAt: hoursAgo(1.5) },
      { id: 'c2', author: 'Mariana Costa', text: 'Fechado, 9h então!', createdAt: hoursAgo(1) },
    ],
  },
  {
    id: 'post2',
    author: 'Caio Rezende',
    createdAt: hoursAgo(5),
    text: 'Primeira semifinal do Rei da Praia vencida: 18 a 14! Agora é foco na final ⚽🏖️',
    sport: 'Futevôlei',
    likes: 41,
    likedByMe: false,
    comments: [{ id: 'c3', author: 'Daniel Peixoto', text: 'Bora, parceiro!', createdAt: hoursAgo(4) }],
  },
  {
    id: 'post3',
    author: 'Akemi Nakamura',
    createdAt: hoursAgo(20),
    text: 'Inscrições abertas para o Desafio de Tênis de Mesa da Liberdade. Melhor de 5 sets, todos os níveis são bem-vindos!',
    sport: 'Tênis de Mesa',
    likes: 18,
    likedByMe: false,
    comments: [],
  },
  {
    id: 'post4',
    author: 'Bianca Siqueira',
    createdAt: hoursAgo(30),
    text: 'Vitória suada no 3º set, 15 a 13. Que jogo! 🏐',
    sport: 'Vôlei de Praia',
    likes: 57,
    likedByMe: false,
    comments: [{ id: 'c4', author: 'Fábio Antunes', text: 'Que defesa no último ponto!', createdAt: hoursAgo(28) }],
  },
  {
    id: 'post5',
    author: 'Ana Clara Mendes',
    createdAt: hoursAgo(50),
    text: 'Falta uma pessoa para o jogo de amanhã às 19h no Padel Morumbi. Quem vem?',
    sport: 'Padel',
    likes: 12,
    likedByMe: false,
    comments: [],
  },
];

export const MOCK_STORIES: StoryGroup[] = [
  {
    author: 'Mariana Costa',
    seen: false,
    items: [
      { id: 's1', createdAt: hoursAgo(3), text: 'Bom dia, quadra! 🎾', background: '#E05434' },
      { id: 's2', createdAt: hoursAgo(2), text: '3 sets hoje. Cansada e feliz.', background: '#1B3A6B' },
    ],
  },
  {
    author: 'Caio Rezende',
    seen: false,
    items: [{ id: 's3', createdAt: hoursAgo(6), text: 'Final do Rei da Praia amanhã ⚽', background: '#F59E0B' }],
  },
  {
    author: 'Bianca Siqueira',
    seen: false,
    items: [{ id: 's4', createdAt: hoursAgo(8), text: 'Pôr do sol + vôlei = 🧡', background: '#7B2CBF' }],
  },
  {
    author: 'Akemi Nakamura',
    seen: false,
    items: [{ id: 's5', createdAt: hoursAgo(10), text: 'Turma nova de tênis de mesa às quartas 🏓', background: '#16A3A3' }],
  },
  {
    author: 'Ana Clara Mendes',
    seen: true,
    items: [{ id: 's6', createdAt: hoursAgo(15), text: 'Quadra de padel reservada para amanhã às 19h', background: '#2B2D42' }],
  },
];
