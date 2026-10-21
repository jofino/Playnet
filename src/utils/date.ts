/** Ex.: "sáb., 04/10 · 09:00". */
export function formatMatchDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
}

/** Ex.: "sáb., 04/10". */
export function formatShortDay(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}
