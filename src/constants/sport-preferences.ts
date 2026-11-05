import type { Sport } from '@/constants/sports';

export type PreferenceKey = 'dominant' | 'side' | 'schedule';

/** `id` é o valor guardado no banco; os checks de `jogador_preferencias` aceitam só estes ids. */
export type PreferenceOption = { id: string; label: string };

export type PreferenceDefinition = {
  key: PreferenceKey;
  emoji: string;
  label: string;
  options: PreferenceOption[];
};

const HAND: PreferenceDefinition = {
  key: 'dominant',
  emoji: '✋',
  label: 'Mão dominante',
  options: [
    { id: 'destra', label: 'Destra' },
    { id: 'canhota', label: 'Canhota' },
    { id: 'ambidestra', label: 'Ambidestra' },
  ],
};

const FOOT: PreferenceDefinition = {
  key: 'dominant',
  emoji: '🦶',
  label: 'Pé dominante',
  options: [
    { id: 'direito', label: 'Direito' },
    { id: 'esquerdo', label: 'Esquerdo' },
    { id: 'ambos', label: 'Ambos' },
  ],
};

const SIDE_OPTIONS: PreferenceOption[] = [
  { id: 'direita', label: 'Direita' },
  { id: 'esquerda', label: 'Esquerda' },
  { id: 'tanto-faz', label: 'Tanto faz' },
];

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
  options: [
    { id: 'manha', label: 'Manhã' },
    { id: 'tarde', label: 'Tarde' },
    { id: 'noite', label: 'Noite' },
    { id: 'qualquer', label: 'Qualquer horário' },
  ],
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
