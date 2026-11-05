export type AppNotification = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  /** Tempo relativo já formatado, ex.: "há 2 h". */
  time: string;
  unread: boolean;
};

// As notificações ainda não têm tabela no banco.
export const NOTIFICATIONS: AppNotification[] = [];

export const UNREAD_NOTIFICATIONS = NOTIFICATIONS.filter((item) => item.unread).length;
