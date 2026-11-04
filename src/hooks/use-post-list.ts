import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { withLikeToggled, type Post } from '@/data/community';
import {
  deletePost,
  fetchPosts,
  POST_PAGE_SIZE,
  setPostLiked,
} from '@/lib/comunidade';
import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchFollows } from '@/lib/perfis';
import { useUser } from '@/state/user-context';

// Distância do fim, em pixels, a partir da qual a próxima página já é carregada.
const LOAD_MORE_DISTANCE = 300;

/** Se a rolagem chegou perto do fim do conteúdo. */
export function isNearEnd({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) {
  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - LOAD_MORE_DISTANCE;
}

type PostListSource =
  /** Todas as publicações. */
  | { kind: 'all' }
  /** De quem o usuário segue e as dele. */
  | { kind: 'following' }
  /** De uma pessoa. */
  | { kind: 'author'; authorId: string };

/** Lista paginada de publicações, atualizada ao voltar para a tela. */
export function usePostList(source: PostListSource) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Última resposta pedida (uma anterior que chegue depois é ignorada) e lista atual, lida fora da renderização.
  const lastRequest = useRef(0);
  const currentPosts = useRef<Post[]>([]);
  const pendingLikes = useRef(new Set<string>());

  const kind = source.kind;
  const authorId = source.kind === 'author' ? source.authorId : null;

  const getAuthorIds = useCallback(async () => {
    if (kind === 'all') return undefined;
    if (authorId) return [authorId];
    const { followingIds } = await fetchFollows(user.id);
    return [user.id, ...followingIds];
  }, [kind, authorId, user.id]);

  const showPosts = useCallback((next: Post[]) => {
    currentPosts.current = next;
    setPosts(next);
  }, []);

  const load = useCallback(
    async (limit: number) => {
      const request = ++lastRequest.current;
      try {
        const next = await fetchPosts({ authorIds: await getAuthorIds(), limit });
        if (request !== lastRequest.current) return;
        showPosts(next);
        setHasMore(next.length === limit);
        setError(null);
      } catch (failure) {
        if (request === lastRequest.current) setError(getDataErrorMessage(failure));
      }
    },
    [getAuthorIds, showPosts]
  );

  // Ao voltar para a tela, recarrega tudo o que já estava visível: curtidas, comentários e
  // publicações apagadas ficam certos sem perder a posição da rolagem.
  const reload = useCallback(async () => {
    await load(Math.max(currentPosts.current.length, POST_PAGE_SIZE));
    setLoading(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setLoadMoreError(null);
    setActionError(null);
    await load(POST_PAGE_SIZE);
    setRefreshing(false);
  }, [load]);

  const retry = useCallback(async () => {
    setLoading(true);
    await reload();
  }, [reload]);

  async function loadMore() {
    const last = currentPosts.current[currentPosts.current.length - 1];
    if (!hasMore || loadingMore || loading || refreshing || !last) return;

    setLoadingMore(true);
    setLoadMoreError(null);
    const request = lastRequest.current;
    try {
      const page = await fetchPosts({ authorIds: await getAuthorIds(), after: last });
      // Uma recarga no meio do caminho já trocou a lista, e esta página não vale mais.
      if (request === lastRequest.current) {
        showPosts([...currentPosts.current, ...page]);
        setHasMore(page.length === POST_PAGE_SIZE);
      }
    } catch (failure) {
      setLoadMoreError(getDataErrorMessage(failure));
    } finally {
      setLoadingMore(false);
    }
  }

  function replacePost(id: string, change: (post: Post) => Post) {
    showPosts(currentPosts.current.map((post) => (post.id === id ? change(post) : post)));
  }

  /** Curte ou descurte na hora e desfaz se o banco recusar. */
  async function toggleLike(post: Post) {
    if (pendingLikes.current.has(post.id)) return;
    pendingLikes.current.add(post.id);
    setActionError(null);
    replacePost(post.id, withLikeToggled);
    try {
      await setPostLiked(post.id, user.id, !post.likedByMe);
    } catch (failure) {
      replacePost(post.id, () => post);
      setActionError(getDataErrorMessage(failure));
    } finally {
      pendingLikes.current.delete(post.id);
    }
  }

  async function removePost(id: string) {
    setActionError(null);
    try {
      await deletePost(id);
      showPosts(currentPosts.current.filter((post) => post.id !== id));
    } catch (failure) {
      setActionError(getDataErrorMessage(failure));
    }
  }

  return {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    loadMoreError,
    actionError,
    reload,
    refresh,
    retry,
    loadMore,
    toggleLike,
    removePost,
  };
}

export type PostList = ReturnType<typeof usePostList>;
