// Dados de exemplo até existir um backend.

export type AppNotification = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  /** Tempo relativo já formatado, ex.: "há 2 h". */
  time: string;
  unread: boolean;
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    emoji: '🎾',
    title: 'Partida confirmada',
    body: 'Sua partida de Tênis no sábado às 9h na Arena Ibirapuera foi confirmada.',
    time: 'há 2 h',
    unread: true,
  },
  {
    id: '2',
    emoji: '👤',
    title: 'Novo seguidor',
    body: 'Mariana Costa começou a seguir você.',
    time: 'há 5 h',
    unread: true,
  },
  {
    id: '3',
    emoji: '🪙',
    title: 'Playnet Coins recebidas',
    body: 'Você ganhou 50 Playnet Coins por completar seu perfil.',
    time: 'ontem',
    unread: false,
  },
  {
    id: '4',
    emoji: '🏆',
    title: 'Ranking atualizado',
    body: 'Você subiu 3 posições no ranking de Tênis em São Paulo.',
    time: 'há 2 dias',
    unread: false,
  },
];

export const UNREAD_NOTIFICATIONS = MOCK_NOTIFICATIONS.filter((item) => item.unread).length;
