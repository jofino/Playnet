import { useLocalSearchParams } from 'expo-router';

import { UserListScreen } from '@/components/user-list-screen';

/** Amigos: seguidores que o usuário também segue. */
export default function AmigosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <UserListScreen userId={id} category="friendIds" emptyText="Nenhum amigo por enquanto." />;
}
