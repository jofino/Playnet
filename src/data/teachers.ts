import type { Sport } from '@/constants/sports';

export type Teacher = {
  id: string;
  name: string;
  sport: Sport;
  /** Média das avaliações dos alunos, de 0 a 5 estrelas. */
  stars: number;
  reviews: number;
  /** Local onde dá aulas (id de VENUES); define o pino no mapa e a distância. */
  venueId: string;
  /** URL da foto; `null` mostra as iniciais. */
  photoUri: string | null;
};

// As aulas ainda não têm tabela no banco.
export const TEACHERS: Teacher[] = [];
