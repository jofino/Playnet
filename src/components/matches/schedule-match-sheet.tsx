import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { SelectField } from '@/components/select-field';
import { Sheet } from '@/components/sheet';
import { SportChips } from '@/components/sport-chips';
import { MATCH_FORMATS, SPORT_MODALITIES, describeFormat } from '@/constants/scoring';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { PLAYERS } from '@/data/players';
import { VENUES } from '@/data/venues';
import type { NewMatch } from '@/state/matches-context';
import { formatShortDay } from '@/utils/date';

const DAYS_AHEAD = 14;
const HOURS = [7, 9, 11, 15, 17, 19, 21];

function nextDays() {
  return Array.from({ length: DAYS_AHEAD }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

type ScheduleMatchSheetProps = {
  onClose: () => void;
  onSchedule: (match: NewMatch) => void;
  /** Esporte já escolhido ao abrir. */
  initialSport?: Sport;
  /** Jogador convidado como adversário (ex.: a partir do perfil dele). */
  invitee?: string;
};

/** Marcar partida: esporte, modalidade, formato de pontuação, parceiro, local, dia e horário. */
export function ScheduleMatchSheet({ onClose, onSchedule, initialSport, invitee }: ScheduleMatchSheetProps) {
  const startSport = initialSport ?? 'Tênis';
  const [sport, setSport] = useState<Sport>(startSport);
  const [modality, setModality] = useState(SPORT_MODALITIES[startSport][0]);
  const [formatId, setFormatId] = useState(MATCH_FORMATS[startSport][0].id);
  const [partner, setPartner] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);

  const days = nextDays();
  const modalities = SPORT_MODALITIES[sport];
  const formats = MATCH_FORMATS[sport];
  const format = formats.find((item) => item.id === formatId) ?? formats[0];
  // Só os locais com quadra/mesa para o esporte escolhido.
  const venues = VENUES.filter((venue) => venue.sports.includes(sport));
  // Parceiros possíveis: quem joga o esporte (menos o convidado, que fica do outro lado).
  const partners = PLAYERS.filter((player) => player.ratings[sport] !== undefined && player.name !== invitee)
    .map((player) => ({ value: player.name, label: player.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const canSubmit = venueId !== null && dayIndex !== null && hour !== null;

  function changeSport(next: Sport) {
    setSport(next);
    setModality(SPORT_MODALITIES[next][0]);
    setFormatId(MATCH_FORMATS[next][0].id);
    setPartner(null);
    if (venueId && !VENUES.find((venue) => venue.id === venueId)?.sports.includes(next)) {
      setVenueId(null);
    }
  }

  function submit() {
    if (venueId === null || dayIndex === null || hour === null) return;
    const date = new Date(days[dayIndex]);
    date.setHours(hour);
    onSchedule({
      sport,
      venueId,
      date: date.toISOString(),
      formatId: format.id,
      playersPerSide: modality === 'Duplas' ? 2 : 1,
      partner: modality === 'Duplas' ? (partner ?? undefined) : undefined,
      opponents: invitee ? [invitee] : [],
    });
    onClose();
  }

  return (
    <Sheet
      visible
      title={invitee ? `Convidar ${invitee}` : 'Marcar partida'}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Marcar" onPress={submit} disabled={!canSubmit} style={styles.footerButton} />
        </>
      }>
      <View style={styles.form}>
        <Text style={styles.label}>Esporte</Text>
        <SportChips value={sport} onChange={changeSport} />

        {modalities.length > 1 && (
          <>
            <Text style={styles.label}>Modalidade</Text>
            <View style={[styles.row, styles.wrap]}>
              {modalities.map((item) => (
                <Chip key={item} label={item} selected={item === modality} onPress={() => setModality(item)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Formato</Text>
        <View style={[styles.row, styles.wrap]}>
          {formats.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={item.id === format.id}
              onPress={() => setFormatId(item.id)}
            />
          ))}
        </View>
        <Text style={styles.help}>{describeFormat(format)}</Text>

        {modality === 'Duplas' && (
          <>
            <Text style={styles.label}>Sua dupla</Text>
            <SelectField
              label="Parceiro(a)"
              value={partner}
              options={partners}
              allLabel="Deixar vaga aberta"
              onChange={setPartner}
            />
          </>
        )}

        <Text style={styles.label}>Local</Text>
        <View style={styles.venues}>
          {venues.map((venue) => {
            const selected = venue.id === venueId;
            return (
              <Pressable
                key={venue.id}
                onPress={() => setVenueId(venue.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={[styles.venue, selected && styles.venueSelected]}>
                <Text style={[styles.venueName, selected && styles.venueNameSelected]}>{venue.name}</Text>
                <Text style={styles.venueNeighborhood}>{venue.neighborhood}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Dia</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {days.map((day, index) => (
            <Chip
              key={day.toISOString()}
              label={index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : formatShortDay(day)}
              selected={index === dayIndex}
              onPress={() => setDayIndex(index)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Horário</Text>
        <View style={[styles.row, styles.wrap]}>
          {HOURS.map((item) => (
            <Chip
              key={item}
              label={`${String(item).padStart(2, '0')}:00`}
              selected={item === hour}
              onPress={() => setHour(item)}
            />
          ))}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: Spacing.four,
    gap: Spacing.three - Spacing.one,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 800,
    marginTop: Spacing.two,
  },
  help: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  venues: {
    gap: Spacing.two,
  },
  venue: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  venueSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FDF3F0',
  },
  venueName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 600,
  },
  venueNameSelected: {
    color: Colors.primary,
    fontWeight: 800,
  },
  venueNeighborhood: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  footerButton: {
    flex: 1,
  },
});
