import type { Sport } from '@/constants/sports';

export type PreferenceKey = 'dominant' | 'side' | 'schedule';

export type PreferenceDefinition = {
  key: PreferenceKey;
  emoji: string;
  label: string;
  options: string[];
};

const HAND: PreferenceDefinition = {
  key: 'dominant',
  emoji: '✋',
  label: 'Mão dominante',
  options: ['Destra', 'Canhota', 'Ambidestra'],
};

const FOOT: PreferenceDefinition = {
  key: 'dominant',
  emoji: '🦶',
  label: 'Pé dominante',
  options: ['Direito', 'Esquerdo', 'Ambos'],
};

const SIDE_OPTIONS = ['Direita', 'Esquerda', 'Tanto faz'];

const COURT_SIDE: PreferenceDefinition = {
  key: 'side',
  emoji: '↔️',
  label: 'Lado da quadra',
  options: SIDE_OPTIONS,
};

const TABLE_SIDE: PreferenceDefinition = {
  key: 'side',
  emoji: '↔️',
  label: 'Lado da mesa (duplas)',
  options: SIDE_OPTIONS,
};

const SCHEDULE: PreferenceDefinition = {
  key: 'schedule',
  emoji: '🌅',
  label: 'Horário de jogo preferido',
  options: ['Manhã', 'Tarde', 'Noite', 'Qualquer horário'],
};

/** Preferências de jogador de cada esporte: membro dominante, lado e horário. */
export const SPORT_PREFERENCES: Record<Sport, PreferenceDefinition[]> = {
  Tênis: [HAND, COURT_SIDE, SCHEDULE],
  'Beach Tennis': [HAND, COURT_SIDE, SCHEDULE],
  Futevôlei: [FOOT, COURT_SIDE, SCHEDULE],
  'Vôlei de Praia': [HAND, COURT_SIDE, SCHEDULE],
  Padel: [HAND, COURT_SIDE, SCHEDULE],
  'Tênis de Mesa': [HAND, TABLE_SIDE, SCHEDULE],
};
