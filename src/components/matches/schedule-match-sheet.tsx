import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { CityPicker } from '@/components/city-picker';
import { Sheet } from '@/components/sheet';
import { SportChips } from '@/components/sport-chips';
import { TextField } from '@/components/text-field';
import { RATING_LEVELS } from '@/constants/rating';
import { SPORT_IDS, type Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import type { City } from '@/data/cities';
import type { MatchLevel } from '@/data/matches';
import { useNow } from '@/hooks/use-now';
import { getMatchErrorMessage, type NewMatch } from '@/lib/partidas';
import { useUser } from '@/state/user-context';
import { formatShortDay } from '@/utils/date';

const DAYS_AHEAD = 14;
const HOURS = [7, 9, 11, 15, 17, 19, 21];
const MIN_SPOTS = 1;
const MAX_SPOTS = 20;

function nextDays(now: number) {
  return Array.from({ length: DAYS_AHEAD }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() + index);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

type ScheduleMatchSheetProps = {
  onClose: () => void;
  /** Cria a partida; se falhar, o painel continua aberto e mostra o erro. */
  onSchedule: (match: NewMatch) => Promise<void>;
  /** Esporte já escolhido ao abrir. */
  initialSport?: Sport;
};

/** Marcar partida: esporte, nível, local, cidade, vagas, dia e horário. */
export function ScheduleMatchSheet({ onClose, onSchedule, initialSport }: ScheduleMatchSheetProps) {
  const { user } = useUser();
  const [sport, setSport] = useState<Sport>(initialSport ?? 'Tênis');
  const [level, setLevel] = useState<MatchLevel>(RATING_LEVELS[0].id);
  const [place, setPlace] = useState('');
  // `undefined`: ainda não mexeu, então vale a cidade do perfil, mesmo que ela chegue depois de abrir.
  const [cityChoice, setCityChoice] = useState<City | null | undefined>(undefined);
  const [spots, setSpots] = useState('4');
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const city = cityChoice === undefined ? user.city : cityChoice;
  const now = useNow();
  const days = nextDays(now);
  const spotsNumber = Number(spots);
  const spotsValid =
    Number.isInteger(spotsNumber) && spotsNumber >= MIN_SPOTS && spotsNumber <= MAX_SPOTS;

  const chosenDate =
    dayIndex !== null && hour !== null ? new Date(days[dayIndex].getTime()) : null;
  chosenDate?.setHours(hour as number);
  const dateInPast = chosenDate !== null && chosenDate.getTime() < now;

  const canSubmit =
    place.trim() !== '' && city !== null && spotsValid && chosenDate !== null && !dateInPast;

  async function submit() {
    if (!canSubmit || submitting || !chosenDate || !city) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSchedule({
        sportId: SPORT_IDS[sport],
        level,
        place: place.trim(),
        cityId: city.id,
        spots: spotsNumber,
        date: chosenDate.toISOString(),
      });
      onClose();
    } catch (failure) {
      setError(getMatchErrorMessage(failure));
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      visible
      title="Marcar partida"
      onClose={onClose}
      footer={
        <>
          <Button
            label="Cancelar"
            variant="outline"
            onPress={onClose}
            disabled={submitting}
            style={styles.footerButton}
          />
          <Button
            label="Marcar"
            onPress={submit}
            disabled={!canSubmit || submitting}
            icon={submitting ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : undefined}
            style={styles.footerButton}
          />
        </>
      }>
      <View style={styles.form}>
        <Text style={styles.label}>Esporte</Text>
        <SportChips value={sport} onChange={setSport} />

        <Text style={styles.label}>Nível</Text>
        <View style={[styles.row, styles.wrap]}>
          {RATING_LEVELS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={item.id === level}
              onPress={() => setLevel(item.id)}
            />
          ))}
        </View>

        <TextField
          label="Local"
          value={place}
          onChangeText={setPlace}
          editable={!submitting}
          placeholder="Nome do clube ou da quadra"
          autoCapitalize="words"
        />
        <CityPicker value={city} onChange={setCityChoice} disabled={submitting} />
        <TextField
          label="Vagas (total de jogadores, incluindo você)"
          value={spots}
          onChangeText={setSpots}
          editable={!submitting}
          keyboardType="number-pad"
          error={spots !== '' && !spotsValid ? `Informe de ${MIN_SPOTS} a ${MAX_SPOTS} vagas.` : undefined}
        />

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
        {dateInPast && <Text style={styles.error}>Esse horário já passou. Escolha outro.</Text>}

        {!!error && (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
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
  error: {
    color: '#D92D20',
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
