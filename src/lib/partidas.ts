import type { Sport } from '@/constants/sports';
import { openSpots, type Match } from '@/data/matches';
import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchProfileNames, UNKNOWN_PLAYER_NAME } from '@/lib/perfis';
import { supabase } from '@/lib/supabase';

const MATCH_COLUMNS = 'id, criador_id, esporte, local, cidade, nivel, data_hora, vagas';

type MatchRow = {
  id: string;
  criador_id: string;
  esporte: string;
  local: string;
  cidade: string;
  nivel: string;
  data_hora: string;
  vagas: number;
};

export type NewMatch = {
  sport: Sport;
  place: string;
  city: string;
  level: string;
  /** Data e hora em ISO 8601. */
  date: string;
  /** Total de jogadores, incluindo quem criou. */
  spots: number;
};

/** A partida lotou entre a tela ser carregada e o usuário tocar em entrar. */
class MatchFullError extends Error {}

/** Traduz uma falha de partidas para uma mensagem em português que pode ir para a tela. */
export function getMatchErrorMessage(error: unknown) {
  if (error instanceof MatchFullError) return 'Essa partida acabou de lotar.';
  return getDataErrorMessage(error);
}

/** Completa as linhas de partidas com os participantes e os nomes deles. */
async function withParticipants(rows: MatchRow[]): Promise<Match[]> {
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('partida_participantes')
    .select('partida_id, user_id')
    .in(
      'partida_id',
      rows.map((row) => row.id)
    )
    .order('criado_em');
  if (error) throw error;

  const names = await fetchProfileNames([...new Set(data.map((link) => link.user_id as string))]);

  return rows.map((row) => ({
    id: row.id,
    creatorId: row.criador_id,
    sport: row.esporte as Sport,
    place: row.local,
    city: row.cidade,
    level: row.nivel,
    date: row.data_hora,
    spots: row.vagas,
    participants: data
      .filter((link) => link.partida_id === row.id)
      .map((link) => ({
        id: link.user_id,
        name: names.get(link.user_id) ?? UNKNOWN_PLAYER_NAME,
      })),
  }));
}

/** Próximas partidas, da mais próxima para a mais distante. */
export async function fetchUpcomingMatches() {
  const { data, error } = await supabase
    .from('partidas')
    .select(MATCH_COLUMNS)
    .gte('data_hora', new Date().toISOString())
    .order('data_hora');
  if (error) throw error;
  return withParticipants(data);
}

export async function fetchMatch(id: string) {
  const { data, error } = await supabase
    .from('partidas')
    .select(MATCH_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [match] = await withParticipants([data]);
  return match;
}

/** Todas as partidas de que o usuário participa, da mais recente para a mais antiga. */
export async function fetchUserMatches(userId: string) {
  const { data: links, error: linksError } = await supabase
    .from('partida_participantes')
    .select('partida_id')
    .eq('user_id', userId);
  if (linksError) throw linksError;
  if (links.length === 0) return [];

  const { data, error } = await supabase
    .from('partidas')
    .select(MATCH_COLUMNS)
    .in(
      'id',
      links.map((link) => link.partida_id)
    )
    .order('data_hora', { ascending: false });
  if (error) throw error;
  return withParticipants(data);
}

/** Cria a partida com o usuário logado como criador e primeiro participante. */
export async function createMatch(match: NewMatch) {
  const { data, error } = await supabase
    .from('partidas')
    .insert({
      esporte: match.sport,
      local: match.place,
      cidade: match.city,
      nivel: match.level,
      data_hora: match.date,
      vagas: match.spots,
    })
    .select('id')
    .single();
  if (error) throw error;

  const { error: joinError } = await supabase
    .from('partida_participantes')
    .insert({ partida_id: data.id });
  if (joinError) {
    // Sem o criador como participante a partida ficaria incoerente.
    await supabase.from('partidas').delete().eq('id', data.id);
    throw joinError;
  }
  return data.id as string;
}

export async function joinMatch(id: string) {
  // O banco não impõe o limite de vagas (ver 002_partidas.sql), então a conferência é feita aqui.
  const match = await fetchMatch(id);
  if (!match || openSpots(match) === 0) throw new MatchFullError();

  const { error } = await supabase.from('partida_participantes').insert({ partida_id: id });
  // 23505: já é participante (ex.: dois toques seguidos), o resultado é o mesmo.
  if (error && error.code !== '23505') throw error;
}

export async function leaveMatch(id: string, userId: string) {
  const { error } = await supabase
    .from('partida_participantes')
    .delete()
    .eq('partida_id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
