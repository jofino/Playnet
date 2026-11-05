import { useState } from 'react';

import type { Sport } from '@/constants/sports';
import type { Teacher } from '@/data/teachers';
import { distanceFromUserKm, getVenue, type Venue } from '@/data/venues';

export type TeacherSort = 'stars' | 'distance';

export type TeacherResult = Teacher & { venue: Venue; distanceKm: number };

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Busca de professores por nome/local, filtro por esporte e ordenação. */
export function useTeacherSearch(teachers: Teacher[]) {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<Sport | null>(null);
  const [sort, setSort] = useState<TeacherSort>('stars');

  const search = normalize(query);

  const results: TeacherResult[] = teachers
    .flatMap((teacher) => {
      const venue = getVenue(teacher.venueId);
      return venue ? [{ ...teacher, venue, distanceKm: distanceFromUserKm(venue) }] : [];
    })
    .filter((teacher) => !sport || teacher.sport === sport)
    .filter(
      (teacher) =>
        !search ||
        [teacher.name, teacher.venue.name, teacher.venue.neighborhood].some((text) =>
          normalize(text).includes(search)
        )
    )
    .sort((a, b) =>
      sort === 'stars'
        ? b.stars - a.stars || b.reviews - a.reviews
        : a.distanceKm - b.distanceKm
    );

  return { query, setQuery, sport, setSport, sort, setSort, results };
}
