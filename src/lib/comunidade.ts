import type { Comment, Post } from '@/data/community';
import { fetchProfileNames, UNKNOWN_PLAYER_NAME } from '@/lib/perfis';
import { supabase } from '@/lib/supabase';

export const POST_PAGE_SIZE = 20;

const POST_COLUMNS =
  'id, autor_id, autor_nome, texto, criado_em, total_curtidas, total_comentarios, curtida_por_mim';

type PostRow = {
  id: string;
  autor_id: string;
  autor_nome: string;
  texto: string;
  criado_em: string;
  total_curtidas: number;
  total_comentarios: number;
  curtida_por_mim: boolean;
};

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    authorId: row.autor_id,
    author: row.autor_nome,
    // Fica como veio do banco: a paginação compara com microssegundos, que um Date perderia.
    createdAt: row.criado_em,
    text: row.texto,
    likes: row.total_curtidas,
    likedByMe: row.curtida_por_mim,
    commentCount: row.total_comentarios,
  };
}

type FetchPostsOptions = {
  /** Só publicações destes autores; sem isso, de todos. */
  authorIds?: string[];
  limit?: number;
  /** Continua a partir desta publicação, a última já carregada. */
  after?: Pick<Post, 'id' | 'createdAt'>;
};

/** Publicações mais recentes primeiro, com o id desempatando as de mesmo instante. */
export async function fetchPosts({ authorIds, limit = POST_PAGE_SIZE, after }: FetchPostsOptions) {
  if (authorIds?.length === 0) return [];

  let query = supabase.from('publicacoes_feed').select(POST_COLUMNS);
  if (authorIds) query = query.in('autor_id', authorIds);
  if (after) {
    // As aspas são necessárias porque a data tem ":" e ".", reservados nesse filtro.
    const date = `"${after.createdAt}"`;
    query = query.or(`criado_em.lt.${date},and(criado_em.eq.${date},id.lt.${after.id})`);
  }

  const { data, error } = await query
    .order('criado_em', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as PostRow[]).map(toPost);
}

export async function fetchPost(id: string) {
  const { data, error } = await supabase
    .from('publicacoes_feed')
    .select(POST_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data && toPost(data as PostRow);
}

export async function createPost(text: string) {
  const { error } = await supabase.from('publicacoes').insert({ texto: text });
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('publicacoes').delete().eq('id', id);
  if (error) throw error;
}

export async function setPostLiked(postId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase.from('publicacao_curtidas').insert({ publicacao_id: postId });
    // 23505: já curtiu (ex.: em outro aparelho), o resultado é o mesmo.
    if (error && error.code !== '23505') throw error;
    return;
  }

  const { error } = await supabase
    .from('publicacao_curtidas')
    .delete()
    .eq('publicacao_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
}

/** Comentários de uma publicação, do mais antigo para o mais recente. */
export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('publicacao_comentarios')
    .select('id, autor_id, texto, criado_em')
    .eq('publicacao_id', postId)
    .order('criado_em', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;

  const names = await fetchProfileNames([...new Set(data.map((row) => row.autor_id as string))]);
  return data.map((row) => ({
    id: row.id,
    authorId: row.autor_id,
    author: names.get(row.autor_id) ?? UNKNOWN_PLAYER_NAME,
    text: row.texto,
    createdAt: row.criado_em,
  }));
}

export async function createComment(postId: string, text: string) {
  const { error } = await supabase
    .from('publicacao_comentarios')
    .insert({ publicacao_id: postId, texto: text });
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from('publicacao_comentarios').delete().eq('id', id);
  if (error) throw error;
}
