import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { StarRating } from '@/components/star-rating';
import { Colors, Spacing } from '@/constants/theme';
import type { TeacherResult } from '@/hooks/use-teacher-search';

function formatDistance(km: number) {
  return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

/** Cartão de professor: foto, nome, esporte, avaliação e distância/local. */
export function TeacherCard({ teacher }: { teacher: TeacherResult }) {
  return (
    <View style={styles.card}>
      <Avatar name={teacher.name} size={56} photoUri={teacher.photoUri} />
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {teacher.name}
        </Text>
        <Text style={styles.sport}>{teacher.sport}</Text>
        <StarRating value={teacher.stars} reviews={teacher.reviews} />
        <Text style={styles.location} numberOfLines={1}>
          📍 {formatDistance(teacher.distanceKm)} · {teacher.venue.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  sport: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 700,
  },
  location: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
