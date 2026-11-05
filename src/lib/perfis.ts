import type { PreferenceKey } from '@/constants/sport-preferences';
import { SPORT_IDS, sportFromId, type Sport } from '@/constants/sports';
import type { City } from '@/data/cities';
import type { User } from '@/data/user';
import { supabase } from '@/lib/supabase';

/** Nome usado quando um usuário ainda não tem perfil. */
export const UNKNOWN_PLAYER_NAME = 'Jogador';

export type Profile = { id: string; name: string };

export type Follows = {
  followerIds: string[];
  followingIds: string[];
  /** Amigos: seguidores que o usuário também segue. */
  friendIds: string[];
};

export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome_exibicao')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data && { id: data.id, name: data.nome_exibicao };
}

/** Nomes de vários usuários, por id. */
export async function fetchProfileNames(ids: string[]) {
  const names = new Map<string, string>();
  if (ids.length === 0) return names;

  const { data, error } = await supabase.from('perfis').select('id, nome_exibicao').in('id', ids);
  if (error) throw error;
  for (const row of data) names.set(row.id, row.nome_exibicao);
  return names;
}

/** Perfis dos usuários informados, em ordem alfabética. */
export async function fetchProfiles(ids: string[]): Promise<Profile[]> {
  const names = await fetchProfileNames(ids);
  return ids
    .map((id) => ({ id, name: names.get(id) ?? UNKNOWN_PLAYER_NAME }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchFollows(userId: string): Promise<Follows> {
  const [followers, following] = await Promise.all([
    supabase.from('seguidores').select('seguidor_id').eq('seguido_id', userId),
    supabase.from('seguidores').select('seguido_id').eq('seguidor_id', userId),
  ]);
  if (followers.error) throw followers.error;
  if (following.error) throw following.error;

  const followerIds = followers.data.map((row) => row.seguidor_id as string);
  const followingIds = following.data.map((row) => row.seguido_id as string);
  return {
    followerIds,
    followingIds,
    friendIds: followerIds.filter((id) => followingIds.includes(id)),
  };
}

export type UserCounts = {
  /** Partidas já realizadas em que o usuário participou. */
  games: number;
  followers: number;
  friends: number;
};

/** Contadores do perfil, sempre consultados no banco, sem nada armazenado. */
export async function fetchUserCounts(userId: string): Promise<UserCounts> {
  const [games, followers, following] = await Promise.all([
    supabase
      .from('partida_participantes')
      .select('partida_id, partidas!inner(data_hora)', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('partidas.data_hora', new Date().toISOString()),
    supabase
      .from('seguidores')
      .select('seguidor_id', { count: 'exact', head: true })
      .eq('seguido_id', userId),
    // Amigos são um cruzamento, que uma contagem simples não resolve: quem segue de volta.
    supabase.from('seguidores').select('seguido_id').eq('seguidor_id', userId),
  ]);
  if (games.error) throw games.error;
  if (followers.error) throw followers.error;
  if (following.error) throw following.error;

  let friends = 0;
  if (following.data.length > 0) {
    const result = await supabase
      .from('seguidores')
      .select('seguidor_id', { count: 'exact', head: true })
      .eq('seguido_id', userId)
      .in(
        'seguidor_id',
        following.data.map((row) => row.seguido_id as string)
      );
    if (result.error) throw result.error;
    friends = result.count ?? 0;
  }

  return { games: games.count ?? 0, followers: followers.count ?? 0, friends };
}

export async function isFollowing(followerId: string, userId: string) {
  const { count, error } = await supabase
    .from('seguidores')
    .select('seguidor_id', { count: 'exact', head: true })
    .eq('seguidor_id', followerId)
    .eq('seguido_id', userId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 20;

// O "*" também é curinga para a API do banco e não tem como ser escapado, então sai do termo.
function toSearchPattern(text: string) {
  const term = text.trim().replaceAll('*', '').replace(/[\\%_]/g, '\\$&');
  return `%${term}%`;
}

/** Busca contas pelo nome de exibição, em ordem alfabética. Só devolve colunas públicas. */
export async function searchProfiles(text: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome_exibicao')
    .ilike('nome_exibicao', toSearchPattern(text))
    .order('nome_exibicao', { ascending: true })
    .order('id', { ascending: true })
    .limit(MAX_SEARCH_RESULTS);
  if (error) throw error;
  return data.map((row) => ({ id: row.id, name: row.nome_exibicao }));
}

export async function followUser(userId: string) {
  const { error } = await supabase.from('seguidores').insert({ seguido_id: userId });
  // 23505: já segue (ex.: dois toques seguidos), o resultado é o mesmo.
  if (error && error.code !== '23505') throw error;
}

export async function unfollowUser(followerId: string, userId: string) {
  const { error } = await supabase
    .from('seguidores')
    .delete()
    .eq('seguidor_id', followerId)
    .eq('seguido_id', userId);
  if (error) throw error;
}

/** Cidade e preferências do usuário logado, guardadas no banco. */
export async function fetchOwnProfileData(userId: string): Promise<Pick<User, 'city' | 'preferences'>> {
  const [profile, savedPreferences] = await Promise.all([
    supabase.from('perfis').select('cidades(id, nome, uf)').eq('id', userId).maybeSingle(),
    supabase
      .from('jogador_preferencias')
      .select('esporte_id, dominante, lado, horario')
      .eq('user_id', userId),
  ]);
  if (profile.error) throw profile.error;
  if (savedPreferences.error) throw savedPreferences.error;

  const preferences: User['preferences'] = {};
  for (const row of savedPreferences.data) {
    const sport = sportFromId(row.esporte_id);
    if (!sport) continue;
    preferences[sport] = {
      dominant: row.dominante ?? undefined,
      side: row.lado ?? undefined,
      schedule: row.horario ?? undefined,
    };
  }

  const city = profile.data?.cidades as unknown as { id: number; nome: string; uf: string } | null | undefined;
  return { city: city ? { id: city.id, name: city.nome, state: city.uf } : null, preferences };
}

export async function updateProfileCity(userId: string, city: City | null) {
  const { error } = await supabase
    .from('perfis')
    .update({ cidade_id: city?.id ?? null })
    .eq('id', userId);
  if (error) throw error;
}

export async function saveSportPreferences(
  userId: string,
  sport: Sport,
  preferences: Partial<Record<PreferenceKey, string>>
) {
  const { error } = await supabase.from('jogador_preferencias').upsert(
    {
      user_id: userId,
      esporte_id: SPORT_IDS[sport],
      dominante: preferences.dominant ?? null,
      lado: preferences.side ?? null,
      horario: preferences.schedule ?? null,
    },
    { onConflict: 'user_id,esporte_id' }
  );
  if (error) throw error;
}

/** Troca o nome na conta e no perfil público, que é o que os outros jogadores veem. */
export async function updateDisplayName(userId: string, name: string) {
  const { error: authError } = await supabase.auth.updateUser({ data: { display_name: name } });
  if (authError) throw authError;

  const { error } = await supabase.from('perfis').update({ nome_exibicao: name }).eq('id', userId);
  if (error) throw error;
}
