import { useLocalSearchParams } from 'expo-router';

import { UserListScreen } from '@/components/user-list-screen';

export default function SeguidoresScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <UserListScreen userId={id} category="followerIds" emptyText="Nenhum seguidor por enquanto." />;
}
