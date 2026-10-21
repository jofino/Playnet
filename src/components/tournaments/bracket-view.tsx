import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatSide } from '@/data/matches';
import type { Tournament } from '@/data/tournaments';
import { roundName, type BracketMatch } from '@/utils/bracket';

type BracketViewProps = {
  tournament: Tournament;
  /** Se informado, jogos prontos (com os dois lados) ganham o botão de registrar placar. */
  onReport?: (round: number, match: number) => void;
};

/** Chaveamento em colunas, uma por fase, rolando na horizontal. */
export function BracketView({ tournament, onReport }: BracketViewProps) {
  const bracket = tournament.bracket;
  if (!bracket) return null;

  const label = (slot: number | null, round: number) => {
    if (slot !== null) return formatSide(tournament.entries[slot], tournament.playersPerSide);
    return round === 0 ? 'BYE (avança direto)' : 'A definir';
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rounds}>
      {bracket.map((matches, round) => (
        <View key={round} style={styles.round}>
          <Text style={styles.roundName}>{roundName(round, bracket.length)}</Text>
          <View style={styles.matches}>
            {matches.map((match: BracketMatch, index) => {
              const ready = match.slots[0] !== null && match.slots[1] !== null && match.winner === undefined;
              return (
                <View key={index} style={styles.match}>
                  {match.slots.map((slot, side) => (
                    <View key={side} style={styles.slotRow}>
                      <Text
                        style={[
                          styles.slot,
                          slot === null && styles.slotEmpty,
                          match.winner !== undefined && slot === match.winner && styles.slotWinner,
                        ]}
                        numberOfLines={2}>
                        {label(slot, round)}
                      </Text>
                      {match.result && (
                        <Text style={[styles.sets, slot === match.winner && styles.slotWinner]}>
                          {match.result.map((set) => set[side]).join(' ')}
                        </Text>
                      )}
                    </View>
                  ))}
                  {ready && onReport && (
                    <Pressable onPress={() => onReport(round, index)} accessibilityRole="button" hitSlop={6}>
                      <Text style={styles.report}>Registrar placar</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rounds: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  round: {
    width: 220,
    gap: Spacing.two,
  },
  roundName: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  matches: {
    flex: 1,
    justifyContent: 'space-around',
    gap: Spacing.three - Spacing.one,
  },
  match: {
    gap: Spacing.one,
    padding: Spacing.three - Spacing.one,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  slot: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: 600,
  },
  slotEmpty: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  slotWinner: {
    color: Colors.primary,
    fontWeight: 800,
  },
  sets: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: 700,
  },
  report: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 800,
    marginTop: Spacing.one,
  },
});
