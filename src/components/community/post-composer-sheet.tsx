import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { SportChips } from '@/components/sport-chips';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { pickImage } from '@/hooks/use-pick-image';

const MAX_LENGTH = 500;

type PostComposerSheetProps = {
  onClose: () => void;
  onPublish: (post: { text: string; sport?: Sport; imageUri?: string }) => void;
};

/** Nova publicação: texto, esporte (opcional) e foto (opcional). */
export function PostComposerSheet({ onClose, onPublish }: PostComposerSheetProps) {
  const [text, setText] = useState('');
  const [sport, setSport] = useState<Sport | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const canPublish = text.trim() !== '' || imageUri !== null;

  async function choosePhoto() {
    const uri = await pickImage();
    if (uri) setImageUri(uri);
  }

  function publish() {
    if (!canPublish) return;
    onPublish({ text: text.trim(), sport: sport ?? undefined, imageUri: imageUri ?? undefined });
    onClose();
  }

  return (
    <Sheet
      visible
      title="Nova publicação"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Publicar" onPress={publish} disabled={!canPublish} style={styles.footerButton} />
        </>
      }>
      <View style={styles.content}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Conte como foi o jogo, procure parceiros, compartilhe dicas…"
          placeholderTextColor={Colors.textSecondary}
          multiline
          maxLength={MAX_LENGTH}
          accessibilityLabel="Texto da publicação"
          style={styles.input}
        />
        <Text style={styles.counter}>
          {text.length}/{MAX_LENGTH}
        </Text>

        {imageUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
            <Button label="Remover foto" size="small" variant="outline" onPress={() => setImageUri(null)} />
          </View>
        ) : (
          <Button label="Adicionar foto" size="small" variant="outline" onPress={choosePhoto} style={styles.photoButton} />
        )}

        <Text style={styles.label}>Esporte (opcional)</Text>
        <SportChips value={sport} onChange={setSport} allLabel="Nenhum" />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three - Spacing.one,
  },
  input: {
    minHeight: 110,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    color: Colors.textSecondary,
    fontSize: 12,
  },
  imageWrap: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
  },
  photoButton: {
    alignSelf: 'flex-start',
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 800,
    marginTop: Spacing.two,
  },
  footerButton: {
    flex: 1,
  },
});
