import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { RATING_LEVELS, type RatingLevel } from '@/constants/rating';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';

type RatingSheetProps = {
  sport: Sport;
  onClose: () => void;
  onConfirm: (rating: number) => void;
};

/** Nivelamento: o jogador escolhe o nível que o descreve e recebe o rating inicial. */
export function RatingSheet({ sport, onClose, onConfirm }: RatingSheetProps) {
  const [level, setLevel] = useState<RatingLevel | null>(null);

  function confirm() {
    if (!level) return;
    onConfirm(level.rating);
    onClose();
  }

  return (
    <Sheet
      visible
      title={`Nivelamento · ${sport}`}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Confirmar" onPress={confirm} disabled={!level} style={styles.footerButton} />
        </>
      }>
      <View style={styles.content}>
        <Text style={styles.intro}>
          Qual nível descreve melhor você no {sport}? Ele define seu rating inicial, que depois muda
          conforme suas partidas.
        </Text>
        {RATING_LEVELS.map((item) => {
          const selected = item.id === level?.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setLevel(item)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${item.label}, rating inicial ${item.rating}. ${item.description}`}
              style={[styles.option, selected && styles.optionSelected]}>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <View style={styles.optionTexts}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingValue}>{item.rating.toLocaleString('pt-BR')}</Text>
                <Text style={styles.ratingLabel}>rating</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three - Spacing.one,
  },
  intro: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.one,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FDF3F0',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionTexts: {
    flex: 1,
    gap: Spacing.half,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  optionDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  ratingValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 800,
  },
  ratingLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: 600,
  },
  footerButton: {
    flex: 1,
  },
});
