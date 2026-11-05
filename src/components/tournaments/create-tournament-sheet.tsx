import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { SelectField } from '@/components/select-field';
import { Sheet } from '@/components/sheet';
import { SportChips } from '@/components/sport-chips';
import { TextField } from '@/components/text-field';
import { MATCH_FORMATS, SPORT_MODALITIES, describeFormat } from '@/constants/scoring';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { ME, PLAYERS } from '@/data/players';
import { VENUES } from '@/data/venues';
import type { NewTournament } from '@/state/tournaments-context';
import { formatShortDay } from '@/utils/date';

const MAX_ENTRIES = [4, 8, 16];
const HOURS = [8, 9, 10, 14, 18, 19];

function nextDays() {
  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

type CreateTournamentSheetProps = {
  onClose: () => void;
  onCreate: (tournament: NewTournament, firstEntry?: string[]) => void;
};

/** Criação de torneio: esporte, modalidade, formato, local, data, vagas e participação do organizador. */
export function CreateTournamentSheet({ onClose, onCreate }: CreateTournamentSheetProps) {
  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('Tênis');
  const [modality, setModality] = useState(SPORT_MODALITIES['Tênis'][0]);
  const [formatId, setFormatId] = useState(MATCH_FORMATS['Tênis'][0].id);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [maxEntries, setMaxEntries] = useState(8);
  const [playing, setPlaying] = useState(true);
  const [partner, setPartner] = useState<string | null>(null);

  const days = nextDays();
  const formats = MATCH_FORMATS[sport];
  const format = formats.find((item) => item.id === formatId) ?? formats[0];
  const venues = VENUES.filter((venue) => venue.sports.includes(sport));
  const doubles = modality === 'Duplas';
  const partners = PLAYERS.filter((player) => player.ratings[sport] !== undefined)
    .map((player) => ({ value: player.name, label: player.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const canCreate =
    name.trim() !== '' && venueId !== null && dayIndex !== null && hour !== null && (!playing || !doubles || partner !== null);

  function changeSport(next: Sport) {
    setSport(next);
    setModality(SPORT_MODALITIES[next][0]);
    setFormatId(MATCH_FORMATS[next][0].id);
    setPartner(null);
    setVenueId(null);
  }

  function create() {
    if (!canCreate || venueId === null || dayIndex === null || hour === null) return;
    const date = new Date(days[dayIndex]);
    date.setHours(hour);
    onCreate(
      {
        name: name.trim(),
        sport,
        venueId,
        date: date.toISOString(),
        formatId: format.id,
        playersPerSide: doubles ? 2 : 1,
        maxEntries,
      },
      playing ? (doubles && partner ? [ME, partner] : [ME]) : undefined
    );
    onClose();
  }

  return (
    <Sheet
      visible
      title="Criar torneio"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Criar" onPress={create} disabled={!canCreate} style={styles.footerButton} />
        </>
      }>
      <View style={styles.form}>
        <TextField label="Nome do torneio" value={name} onChangeText={setName} placeholder="Ex.: Desafio de Verão" />

        <Text style={styles.label}>Esporte</Text>
        <SportChips value={sport} onChange={changeSport} />

        {SPORT_MODALITIES[sport].length > 1 && (
          <>
            <Text style={styles.label}>Modalidade</Text>
            <View style={styles.wrap}>
              {SPORT_MODALITIES[sport].map((item) => (
                <Chip key={item} label={item} selected={item === modality} onPress={() => setModality(item)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Formato dos jogos</Text>
        <View style={styles.wrap}>
          {formats.map((item) => (
            <Chip key={item.id} label={item.label} selected={item.id === format.id} onPress={() => setFormatId(item.id)} />
          ))}
        </View>
        <Text style={styles.help}>{describeFormat(format)}</Text>

        <Text style={styles.label}>Vagas ({doubles ? 'duplas' : 'jogadores'})</Text>
        <View style={styles.wrap}>
          {MAX_ENTRIES.map((item) => (
            <Chip key={item} label={String(item)} selected={item === maxEntries} onPress={() => setMaxEntries(item)} />
          ))}
        </View>

        <Text style={styles.label}>Local</Text>
        <View style={styles.wrap}>
          {venues.map((venue) => (
            <Chip key={venue.id} label={venue.name} selected={venue.id === venueId} onPress={() => setVenueId(venue.id)} />
          ))}
        </View>

        <Text style={styles.label}>Data</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {days.map((day, index) => (
            <Chip
              key={day.toISOString()}
              label={formatShortDay(day)}
              selected={index === dayIndex}
              onPress={() => setDayIndex(index)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Horário de início</Text>
        <View style={styles.wrap}>
          {HOURS.map((item) => (
            <Chip key={item} label={`${String(item).padStart(2, '0')}:00`} selected={item === hour} onPress={() => setHour(item)} />
          ))}
        </View>

        <Text style={styles.label}>Você vai jogar?</Text>
        <View style={styles.wrap}>
          <Chip label="Sim, me inscrever" selected={playing} onPress={() => setPlaying(true)} />
          <Chip label="Só organizar" selected={!playing} onPress={() => setPlaying(false)} />
        </View>
        {playing && doubles && (
          <SelectField label="Sua dupla" value={partner} options={partners} allLabel="Escolher…" onChange={setPartner} />
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
  help: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  footerButton: {
    flex: 1,
  },
});
