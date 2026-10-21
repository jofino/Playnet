import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { SelectField } from '@/components/select-field';
import { Sheet } from '@/components/sheet';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { ME, PLAYERS } from '@/data/players';

type EntrySheetProps = {
  title: string;
  sport: Sport;
  playersPerSide: 1 | 2;
  /** `true`: o usuário é um dos membros (só escolhe o parceiro). */
  includeMe: boolean;
  /** Nomes que já estão inscritos e não podem ser escolhidos. */
  excluded: string[];
  onClose: () => void;
  onConfirm: (entry: string[]) => void;
};

/** Escolha de jogador(es) para uma inscrição de torneio. */
export function EntrySheet({ title, sport, playersPerSide, includeMe, excluded, onClose, onConfirm }: EntrySheetProps) {
  const slots = playersPerSide - (includeMe ? 1 : 0);
  const [picked, setPicked] = useState<(string | null)[]>(() => Array(slots).fill(null));

  const available = PLAYERS.filter((player) => player.ratings[sport] !== undefined && !excluded.includes(player.name))
    .map((player) => ({ value: player.name, label: `${player.name} · ${player.ratings[sport]}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const complete = picked.every((name) => name !== null) && new Set(picked).size === picked.length;

  function confirm() {
    if (!complete) return;
    onConfirm([...(includeMe ? [ME] : []), ...(picked as string[])]);
    onClose();
  }

  return (
    <Sheet
      visible
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Confirmar" onPress={confirm} disabled={!complete} style={styles.footerButton} />
        </>
      }>
      <View style={styles.content}>
        {includeMe && slots === 0 && (
          <Text style={styles.text}>Confirme sua inscrição neste torneio de simples.</Text>
        )}
        {picked.map((value, index) => (
          <SelectField
            key={index}
            label={includeMe ? 'Sua dupla' : slots > 1 ? `Jogador ${index + 1}` : 'Jogador'}
            value={value}
            // Não deixa escolher a mesma pessoa duas vezes.
            options={available.filter((option) => option.value === value || !picked.includes(option.value))}
            allLabel="Escolher…"
            onChange={(name) => setPicked((current) => current.map((item, i) => (i === index ? name : item)))}
          />
        ))}
        <Text style={styles.hint}>Aparecem só jogadores de {sport} ainda não inscritos, com o rating de cada um.</Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  text: {
    color: Colors.text,
    fontSize: 15,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  footerButton: {
    flex: 1,
  },
});
