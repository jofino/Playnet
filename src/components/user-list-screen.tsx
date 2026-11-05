import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ERROR_ICON, StateMessage } from '@/components/state-message';
import { UserRow } from '@/components/user-row';
import { Colors, Spacing } from '@/constants/theme';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchFollows, fetchProfiles, type Follows, type Profile } from '@/lib/perfis';

type UserListScreenProps = {
  userId: string;
  /** Qual lista de conexões do usuário mostrar. */
  category: keyof Follows;
  emptyText: string;
};

/** Lista de usuários de uma categoria (seguidores, amigos); cada linha abre o perfil. */
export function UserListScreen({ userId, category, emptyText }: UserListScreenProps) {
  useLightStatusBar();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const follows = await fetchFollows(userId);
      setUsers(await fetchProfiles(follows[category]));
      setError(null);
    } catch (failure) {
      setError(getDataErrorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, [userId, category]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScreenScrollView
      withTabBar={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />
      ) : error ? (
        <StateMessage
          icon={ERROR_ICON}
          text={error}
          onRetry={() => {
            setLoading(true);
            load();
          }}
        />
      ) : users.length > 0 ? (
        <View style={styles.list}>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </View>
      ) : (
        <StateMessage icon={{ ios: 'person.2', android: 'group', web: 'group' }} text={emptyText} />
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: Spacing.four,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
});
