import { useRouter } from 'expo-router';

import { ME, getPlayerByName } from '@/data/players';
import { useUser } from '@/state/user-context';

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

/** Abre o perfil de um usuário real pelo id (o próprio usuário vai para a aba Perfil). */
export function useOpenUserProfile() {
  const router = useRouter();
  const { user } = useUser();

  return (id: string) => {
    if (id === user.id) {
      router.navigate('/perfil');
      return;
    }
    router.push({ pathname: '/jogador/[id]', params: { id } });
  };
}

/** Se o nome tem perfil para abrir (o usuário ou um jogador do diretório). */
export function hasProfile(name: string) {
  return name === ME || getPlayerByName(name) !== undefined;
}
