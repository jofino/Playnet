/** Tempo relativo curto, ex.: "agora", "há 5 min", "há 2 h", "ontem", "há 3 dias". */
export function formatRelative(iso: string, now = Date.now()) {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

/** ISO de um instante no passado, para dados de exemplo. */
export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}
