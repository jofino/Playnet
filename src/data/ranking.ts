import type { Sport } from '@/constants/sports';

// Dados de exemplo até existir um backend.

export const STATE_NAMES = {
  SP: 'São Paulo',
  RJ: 'Rio de Janeiro',
  MG: 'Minas Gerais',
  PR: 'Paraná',
  SC: 'Santa Catarina',
  RS: 'Rio Grande do Sul',
} as const;

export type StateCode = keyof typeof STATE_NAMES;

export type RankedPlayer = {
  id: string;
  name: string;
  sport: Sport;
  state: StateCode;
  city: string;
  /** Rating do jogador no esporte. */
  rating: number;
};

type PlayerRow = [name: string, sport: Sport, state: StateCode, city: string, rating: number];

const ROWS: PlayerRow[] = [
  ['Lucas Andrade', 'Tênis', 'SP', 'São Paulo', 1840],
  ['Mariana Costa', 'Tênis', 'SP', 'São Paulo', 1765],
  ['Rafael Moreira', 'Tênis', 'SP', 'Campinas', 1710],
  ['Beatriz Lima', 'Tênis', 'SP', 'Santos', 1580],
  ['Gustavo Pereira', 'Tênis', 'RJ', 'Rio de Janeiro', 1820],
  ['Camila Rocha', 'Tênis', 'RJ', 'Niterói', 1490],
  ['Thiago Martins', 'Tênis', 'MG', 'Belo Horizonte', 1690],
  ['Larissa Souza', 'Tênis', 'MG', 'Uberlândia', 1420],
  ['Felipe Carvalho', 'Tênis', 'PR', 'Curitiba', 1655],
  ['Juliana Ribeiro', 'Tênis', 'PR', 'Londrina', 1380],
  ['Bruno Almeida', 'Tênis', 'SC', 'Florianópolis', 1610],
  ['Renata Gomes', 'Tênis', 'RS', 'Porto Alegre', 1735],
  ['Diego Fernandes', 'Tênis', 'RS', 'Porto Alegre', 1515],
  ['Pedro Henrique Dias', 'Tênis', 'SP', 'São Paulo', 1450],

  ['Ana Clara Mendes', 'Padel', 'SP', 'São Paulo', 1905],
  ['Rodrigo Nunes', 'Padel', 'SP', 'São Paulo', 1780],
  ['Isabela Teixeira', 'Padel', 'SP', 'Campinas', 1640],
  ['Vinícius Barros', 'Padel', 'RJ', 'Rio de Janeiro', 1860],
  ['Fernanda Lopes', 'Padel', 'RJ', 'Rio de Janeiro', 1700],
  ['Marcelo Pinto', 'Padel', 'MG', 'Belo Horizonte', 1575],
  ['Carolina Freitas', 'Padel', 'PR', 'Curitiba', 1725],
  ['André Cardoso', 'Padel', 'SC', 'Florianópolis', 1810],
  ['Patrícia Azevedo', 'Padel', 'SC', 'Florianópolis', 1530],
  ['Eduardo Ramos', 'Padel', 'RS', 'Porto Alegre', 1665],
  ['Gabriela Monteiro', 'Padel', 'SP', 'Santos', 1495],

  ['Leonardo Castro', 'Beach Tennis', 'RJ', 'Rio de Janeiro', 1880],
  ['Aline Batista', 'Beach Tennis', 'RJ', 'Rio de Janeiro', 1745],
  ['Ricardo Vieira', 'Beach Tennis', 'RJ', 'Niterói', 1620],
  ['Natália Correia', 'Beach Tennis', 'SP', 'Santos', 1790],
  ['Mateus Araújo', 'Beach Tennis', 'SP', 'São Paulo', 1560],
  ['Priscila Duarte', 'Beach Tennis', 'SC', 'Florianópolis', 1705],
  ['Henrique Farias', 'Beach Tennis', 'PR', 'Curitiba', 1430],
  ['Tatiane Moura', 'Beach Tennis', 'RS', 'Porto Alegre', 1515],

  ['Caio Rezende', 'Futevôlei', 'RJ', 'Rio de Janeiro', 1925],
  ['Daniel Peixoto', 'Futevôlei', 'RJ', 'Rio de Janeiro', 1810],
  ['Igor Santana', 'Futevôlei', 'RJ', 'Niterói', 1655],
  ['Letícia Prado', 'Futevôlei', 'SP', 'Santos', 1600],
  ['Otávio Brandão', 'Futevôlei', 'SC', 'Florianópolis', 1720],
  ['Sabrina Queiroz', 'Futevôlei', 'MG', 'Belo Horizonte', 1385],
  ['Murilo Tavares', 'Futevôlei', 'SP', 'São Paulo', 1470],
  ['Thiago Lemos', 'Futevôlei', 'RJ', 'Niterói', 1540],

  ['Bianca Siqueira', 'Vôlei de Praia', 'RJ', 'Rio de Janeiro', 1860],
  ['Fábio Antunes', 'Vôlei de Praia', 'RJ', 'Rio de Janeiro', 1775],
  ['Helena Rocha', 'Vôlei de Praia', 'SC', 'Florianópolis', 1690],
  ['João Pedro Lacerda', 'Vôlei de Praia', 'SP', 'Santos', 1640],
  ['Marina Vasconcelos', 'Vôlei de Praia', 'MG', 'Belo Horizonte', 1525],
  ['Otávio Guimarães', 'Vôlei de Praia', 'PR', 'Curitiba', 1460],
  ['Yasmin Cunha', 'Vôlei de Praia', 'RS', 'Porto Alegre', 1580],

  ['Akemi Nakamura', 'Tênis de Mesa', 'SP', 'São Paulo', 1870],
  ['Paulo Sakamoto', 'Tênis de Mesa', 'SP', 'São Paulo', 1690],
  ['Luiza Hayashi', 'Tênis de Mesa', 'SP', 'Campinas', 1540],
  ['Gustavo Okada', 'Tênis de Mesa', 'PR', 'Curitiba', 1615],
  ['Renan Moraes', 'Tênis de Mesa', 'RJ', 'Rio de Janeiro', 1480],
  ['Clara Watanabe', 'Tênis de Mesa', 'MG', 'Belo Horizonte', 1395],
];

export const RANKED_PLAYERS: RankedPlayer[] = ROWS.map(([name, sport, state, city, rating], index) => ({
  id: String(index + 1),
  name,
  sport,
  state,
  city,
  rating,
}));
