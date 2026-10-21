import type { Sport } from '@/constants/sports';

// Dados de exemplo até existir um backend.

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

type TeacherRow = [name: string, sport: Sport, stars: number, reviews: number, venueId: string];

const ROWS: TeacherRow[] = [
  ['Carla Menezes', 'Tênis', 4.9, 128, 'pinheiros'],
  ['Roberto Salles', 'Tênis', 4.6, 74, 'ibirapuera'],
  ['Juliana Prates', 'Tênis', 4.2, 31, 'santana'],
  ['Thiago Barreto', 'Beach Tennis', 4.8, 96, 'vila-olimpia'],
  ['Amanda Rios', 'Beach Tennis', 4.5, 52, 'mooca'],
  ['Diego Nascimento', 'Futevôlei', 4.7, 61, 'vila-olimpia'],
  ['Paulo Henrique Sá', 'Futevôlei', 4.1, 18, 'mooca'],
  ['Fernanda Kuster', 'Vôlei de Praia', 4.9, 87, 'mooca'],
  ['Marcos Vidal', 'Vôlei de Praia', 4.4, 40, 'tatuape'],
  ['Luana Teles', 'Padel', 4.8, 112, 'morumbi'],
  ['Gabriel Arruda', 'Padel', 4.3, 27, 'lapa'],
  ['Renata Cury', 'Padel', 4.6, 58, 'ibirapuera'],
  ['Akemi Nakamura', 'Tênis de Mesa', 4.9, 64, 'liberdade'],
  ['Rodrigo Fukuda', 'Tênis de Mesa', 4.4, 22, 'santana'],
];

export const MOCK_TEACHERS: Teacher[] = ROWS.map(([name, sport, stars, reviews, venueId], index) => ({
  id: `t${index + 1}`,
  name,
  sport,
  stars,
  reviews,
  venueId,
  photoUri: null,
}));
