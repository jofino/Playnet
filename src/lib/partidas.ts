import { sportFromId, type SportId } from '@/constants/sports';
import { formatCity } from '@/data/cities';
import { openSpots, type Match, type MatchLevel } from '@/data/matches';
import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchProfileNames, UNKNOWN_PLAYER_NAME } from '@/lib/perfis';
import { supabase } from '@/lib/supabase';

const MATCH_COLUMNS =
  'id, criador_id, esporte_id, cidade_id, local, nivel, data_hora, vagas, cidades(nome, uf), esportes(nome)';

type MatchRow = {
  id: string;
  criador_id: string | null;
  esporte_id: string;
  cidade_id: number;
  local: string;
  nivel: MatchLevel;
  data_hora: string;
  vagas: number;
  cidades: { nome: string; uf: string };
  esportes: { nome: string };
};

// Sem os tipos gerados do banco, o cliente supõe que toda relação é uma lista; por chave estrangeira, vem um objeto.
const asMatchRows = (rows: unknown) => rows as MatchRow[];

export type NewMatch = {
  sportId: SportId;
  place: string;
  cityId: number;
  level: MatchLevel;
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

  return rows.flatMap((row) => {
    // Um esporte novo só existe para versões do app que já o conhecem: ícones e formatos dependem dele.
    const sport = sportFromId(row.esporte_id);
    if (!sport) return [];

    return {
      id: row.id,
      creatorId: row.criador_id,
      sport,
      sportName: row.esportes.nome,
      place: row.local,
      cityId: row.cidade_id,
      city: formatCity({ name: row.cidades.nome, state: row.cidades.uf }),
      level: row.nivel,
      date: row.data_hora,
      spots: row.vagas,
      participants: data
        .filter((link) => link.partida_id === row.id)
        .map((link) => ({
          id: link.user_id,
          name: names.get(link.user_id) ?? UNKNOWN_PLAYER_NAME,
        })),
    };
  });
}

/** Próximas partidas, da mais próxima para a mais distante. */
export async function fetchUpcomingMatches() {
  const { data, error } = await supabase
    .from('partidas')
    .select(MATCH_COLUMNS)
    .gte('data_hora', new Date().toISOString())
    .order('data_hora');
  if (error) throw error;
  return withParticipants(asMatchRows(data));
}

export async function fetchMatch(id: string) {
  const { data, error } = await supabase
    .from('partidas')
    .select(MATCH_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [match] = await withParticipants(asMatchRows([data]));
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
  return withParticipants(asMatchRows(data));
}

/** Cria a partida com o usuário logado como criador e primeiro participante. */
export async function createMatch(match: NewMatch) {
  const { data, error } = await supabase
    .from('partidas')
    .insert({
      esporte_id: match.sportId,
      local: match.place,
      cidade_id: match.cityId,
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
