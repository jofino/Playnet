import { useEffect, useState } from 'react';

/** Horário atual estável durante a renderização, atualizado a cada minuto. */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
