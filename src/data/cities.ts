export type City = {
  /** Código IBGE. */
  id: number;
  name: string;
  /** Sigla do estado, ex.: "SP". */
  state: string;
};

/** Texto da cidade para exibir, ex.: "São Paulo, SP". */
export function formatCity(city: Pick<City, 'name' | 'state'>) {
  return `${city.name}, ${city.state}`;
}
