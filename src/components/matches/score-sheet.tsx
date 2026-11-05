import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { describeSetRule, getFormat, validateMatch, type SetScore } from '@/constants/scoring';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';

type ScoreSheetProps = {
  sport: Sport;
  formatId: string;
  /** Nomes dos dois lados, na ordem do placar. */
  sideLabels: [string, string];
  /** Linha de contexto, ex.: data e local. */
  subtitle?: string;
  onClose: () => void;
  onSave: (result: SetScore[], winner: 0 | 1) => void;
};

/**
 * Registro de placar set a set. Só aceita placares possíveis nas regras do esporte
 * e do formato (ex.: 7-6 no tênis, 22-20 no vôlei de praia, 12-10 no tênis de mesa).
 */
export function ScoreSheet({ sport, formatId, sideLabels, subtitle, onClose, onSave }: ScoreSheetProps) {
  const format = getFormat(sport, formatId);
  const [sets, setSets] = useState<[string, string][]>(() => format.sets.map(() => ['', '']));
  const [error, setError] = useState<string | null>(null);

  function updateScore(setIndex: number, side: 0 | 1, value: string) {
    setError(null);
    setSets((current) =>
      current.map((set, index) => {
        if (index !== setIndex) return set;
        const next: [string, string] = [...set];
        next[side] = value.replace(/\D/g, '');
        return next;
      })
    );
  }

  function save() {
    const halfFilled = sets.findIndex(([a, b]) => (a === '') !== (b === ''));
    if (halfFilled >= 0) {
      setError(`${halfFilled + 1}º set: preencha os dois lados.`);
      return;
    }
    // Sets em branco no fim são ignorados; um set em branco no meio é erro.
    const lastFilled = sets.reduce((last, [a], index) => (a !== '' ? index : last), -1);
    const used = sets.slice(0, lastFilled + 1);
    const gap = used.findIndex(([a]) => a === '');
    if (gap >= 0) {
      setError(`${gap + 1}º set está em branco.`);
      return;
    }
    const result: SetScore[] = used.map(([a, b]) => [Number(a), Number(b)]);
    const validation = validateMatch(format, result);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    onSave(result, validation.winner);
    onClose();
  }

  return (
    <Sheet
      visible
      title="Registrar resultado"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Salvar" onPress={save} style={styles.footerButton} />
        </>
      }>
      <View style={styles.content}>
        <Text style={styles.format}>
          {sport} · {format.label}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        <View style={styles.row}>
          <View style={styles.setLabel} />
          {sideLabels.map((label, index) => (
            <Text key={index} style={styles.sideLabel} numberOfLines={2}>
              {label}
            </Text>
          ))}
        </View>

        {format.sets.map((rule, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.setLabel}>
              <Text style={styles.setName}>{index + 1}º set</Text>
              <Text style={styles.setRule}>{describeSetRule(rule)}</Text>
            </View>
            {([0, 1] as const).map((side) => (
              <TextInput
                key={side}
                value={sets[index][side]}
                onChangeText={(value) => updateScore(index, side, value)}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="–"
                placeholderTextColor={Colors.border}
                accessibilityLabel={`${index + 1}º set, ${sideLabels[side]}`}
                style={styles.input}
              />
            ))}
          </View>
        ))}

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : (
          <Text style={styles.hint}>
            Preencha os sets jogados. Com {format.setsToWin}{' '}
            {format.setsToWin === 1 ? 'set vencido' : 'sets vencidos'} a partida acaba.
          </Text>
        )}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three - Spacing.one,
  },
  format: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 800,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: -Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
  },
  setLabel: {
    width: 96,
  },
  setName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 700,
  },
  setRule: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  sideLabel: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
  },
  // flexBasis/minWidth 0: sem isso, na web o campo usa a largura padrão do navegador e transborda.
  input: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 18,
    fontWeight: 700,
  },
  error: {
    color: '#D92D20',
    fontSize: 14,
    fontWeight: 600,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  footerButton: {
    flex: 1,
  },
});
