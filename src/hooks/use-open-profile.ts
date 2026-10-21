import { useRouter } from 'expo-router';

import { ME, getPlayerByName } from '@/data/players';

/** Abre o perfil de um jogador pelo nome ("Você" leva à aba Perfil). */
export function useOpenProfile() {
  const router = useRouter();

  return (name: string) => {
    if (name === ME) {
      router.navigate('/perfil');
      return;
    }
    const player = getPlayerByName(name);
    if (player) router.push({ pathname: '/jogador/[id]', params: { id: player.id } });
  };
}

/** Se o nome tem perfil para abrir (o usuário ou um jogador do diretório). */
export function hasProfile(name: string) {
  return name === ME || getPlayerByName(name) !== undefined;
}
