import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { MatchCard } from '@/components/matches/match-card';
import { ScheduleMatchSheet } from '@/components/matches/schedule-match-sheet';
import { QuickAction } from '@/components/quick-action';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SectionHeader } from '@/components/section-header';
import { StarRating } from '@/components/star-rating';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { Colors, Spacing } from '@/constants/theme';
import { byDate, isFinished, isMine, openSpots } from '@/data/matches';
import { MOCK_TEACHERS } from '@/data/teachers';
import { tournamentStatus } from '@/data/tournaments';
import { useNow } from '@/hooks/use-now';
import { useMatchesStore } from '@/state/matches-context';
import { useTournaments } from '@/state/tournaments-context';
import { useUser } from '@/state/user-context';

const TOP_TEACHERS = [...MOCK_TEACHERS].sort((a, b) => b.stars - a.stars || b.reviews - a.reviews).slice(0, 6);

/** Aba central: tudo para entrar em quadra — partidas, torneios e aulas. */
export default function JogarScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { matches, createMatch } = useMatchesStore();
  const { tournaments } = useTournaments();
  const [scheduling, setScheduling] = useState(false);

  const now = useNow();
  const myUpcoming = matches.filter((m) => isMine(m) && !isFinished(m, now)).sort(byDate);
  const awaitingResult = matches.filter((m) => isMine(m) && isFinished(m, now) && !m.result).sort(byDate);
  const withSpots = matches
    .filter((m) => !isMine(m) && !isFinished(m, now) && openSpots(m) > 0)
    .sort(byDate);
  const activeTournaments = tournaments.filter((t) => tournamentStatus(t) !== 'Encerrado');

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Jogar" />

      <ScreenScrollView>
        <Text style={[styles.section, styles.greeting]}>Bora jogar, {user.name.split(' ')[0]}?</Text>
        <View style={[styles.section, styles.quickActions]}>
          <QuickAction
            label="Marcar partida"
            icon={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
            onPress={() => setScheduling(true)}
          />
          <QuickAction
            label="Encontrar partida"
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            onPress={() => router.push('/partidas')}
          />
          <QuickAction
            label="Aprender"
            icon={{ ios: 'graduationcap.fill', android: 'school', web: 'school' }}
            onPress={() => router.push('/aprender')}
          />
          <QuickAction
            label="Torneios"
            icon={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
            onPress={() => router.push('/torneios')}
          />
        </View>

        {myUpcoming.length > 0 && (
          <>
            <SectionHeader title="Suas próximas partidas" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {myUpcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        {awaitingResult.length > 0 && (
          <>
            <SectionHeader
              title="Aguardando resultado"
              subtitle="Registre o placar para atualizar seu rating."
              style={[styles.section, styles.sectionSpacing]}
            />
            <View style={[styles.section, styles.list]}>
              {awaitingResult.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        <SectionHeader
          title="Partidas com vagas"
          actionLabel="Ver todas"
          onAction={() => router.push('/partidas')}
          style={[styles.section, styles.sectionSpacing]}
        />
        {withSpots.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {withSpots.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.section, styles.empty]}>
            <Text style={styles.emptyText}>Nenhuma partida com vagas agora.</Text>
            <Button label="Marcar uma partida" size="small" onPress={() => setScheduling(true)} />
          </View>
        )}

        <SectionHeader
          title="Torneios"
          actionLabel="Ver todos"
          onAction={() => router.push('/torneios')}
          style={[styles.section, styles.sectionSpacing]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {activeTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} compact />
          ))}
        </ScrollView>

        <SectionHeader
          title="Aprender"
          subtitle="Professores mais bem avaliados perto de você."
          actionLabel="Ver todos"
          onAction={() => router.push('/aprender')}
          style={[styles.section, styles.sectionSpacing]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {TOP_TEACHERS.map((teacher) => (
            <Pressable
              key={teacher.id}
              onPress={() => router.push('/aprender')}
              accessibilityRole="button"
              accessibilityLabel={`${teacher.name}, professor de ${teacher.sport}`}
              style={({ pressed }) => [styles.teacher, pressed && styles.pressed]}>
              <Avatar name={teacher.name} size={56} photoUri={teacher.photoUri} />
              <Text style={styles.teacherName} numberOfLines={1}>
                {teacher.name}
              </Text>
              <Text style={styles.teacherSport}>{teacher.sport}</Text>
              <StarRating value={teacher.stars} />
            </Pressable>
          ))}
        </ScrollView>
      </ScreenScrollView>

      {scheduling && (
        <ScheduleMatchSheet
          onClose={() => setScheduling(false)}
          onSchedule={(match) => {
            const id = createMatch(match);
            router.push({ pathname: '/partida/[id]', params: { id } });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.four,
  },
  sectionSpacing: {
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  greeting: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: 800,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  list: {
    gap: Spacing.three - Spacing.one,
  },
  carousel: {
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.one,
  },
  empty: {
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  teacher: {
    width: 150,
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  pressed: {
    opacity: 0.8,
  },
  teacherName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 800,
    marginTop: Spacing.one,
  },
  teacherSport: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 700,
  },
});
