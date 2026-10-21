/**
 * "Rating" é o termo oficial do Playnet para a métrica de nível do jogador em cada esporte.
 * O nivelamento define o rating inicial a partir de uma autoavaliação.
 */
export const RATING_LEVELS = [
  {
    id: 'iniciante',
    label: 'Iniciante',
    rating: 500,
    description: 'Está começando ou joga há pouco tempo.',
  },
  {
    id: 'intermediario',
    label: 'Intermediário',
    rating: 1000,
    description: 'Joga com frequência e domina os fundamentos.',
  },
  {
    id: 'avancado',
    label: 'Avançado',
    rating: 1500,
    description: 'Compete ou joga em alto nível há bastante tempo.',
  },
] as const;

export type RatingLevel = (typeof RATING_LEVELS)[number];
