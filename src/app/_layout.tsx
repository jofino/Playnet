import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { CommunityProvider } from '@/state/community-context';
import { MatchesProvider } from '@/state/matches-context';
import { TournamentsProvider } from '@/state/tournaments-context';
import { UserProvider } from '@/state/user-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <UserProvider>
      <MatchesProvider>
        <TournamentsProvider>
          <CommunityProvider>
            <ThemeProvider value={DefaultTheme}>
              <AnimatedSplashOverlay />
              {/* As abas ficam no grupo (tabs); as demais telas abrem por cima delas. */}
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: Colors.primary },
                  headerTintColor: Colors.onPrimary,
                  headerTitleStyle: { fontWeight: '800' },
                  headerBackButtonDisplayMode: 'minimal',
                }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="notificacoes" options={{ title: 'Notificações' }} />
                <Stack.Screen name="aprender" options={{ title: 'Aprender' }} />
                <Stack.Screen name="partidas" options={{ title: 'Encontrar partida' }} />
                <Stack.Screen name="partida/[id]" options={{ title: 'Partida' }} />
                <Stack.Screen name="torneios" options={{ title: 'Torneios' }} />
                <Stack.Screen name="torneio/[id]" options={{ title: 'Torneio' }} />
                <Stack.Screen name="jogador/[id]" options={{ title: 'Perfil' }} />
                <Stack.Screen name="post/[id]" options={{ title: 'Publicação' }} />
              </Stack>
            </ThemeProvider>
          </CommunityProvider>
        </TournamentsProvider>
      </MatchesProvider>
    </UserProvider>
  );
}
