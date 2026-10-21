import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { Colors, Spacing } from '@/constants/theme';
import { STORY_BACKGROUNDS, type StoryItem } from '@/data/community';
import { pickImage } from '@/hooks/use-pick-image';

type StoryComposerSheetProps = {
  onClose: () => void;
  onPublish: (story: Omit<StoryItem, 'id' | 'createdAt'>) => void;
};

/** Novo story: texto sobre uma cor de fundo, ou uma foto. */
export function StoryComposerSheet({ onClose, onPublish }: StoryComposerSheetProps) {
  const [text, setText] = useState('');
  const [background, setBackground] = useState(STORY_BACKGROUNDS[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const canPublish = imageUri !== null || text.trim() !== '';

  async function choosePhoto() {
    const uri = await pickImage([9, 16]);
    if (uri) setImageUri(uri);
  }

  function publish() {
    if (!canPublish) return;
    onPublish(imageUri ? { imageUri } : { text: text.trim(), background });
    onClose();
  }

  return (
    <Sheet
      visible
      title="Novo story"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Publicar" onPress={publish} disabled={!canPublish} style={styles.footerButton} />
        </>
      }>
      <View style={styles.content}>
        {/* Prévia do story. */}
        <View style={[styles.preview, { backgroundColor: imageUri ? '#000000' : background }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escreva algo…"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              multiline
              maxLength={120}
              accessibilityLabel="Texto do story"
              style={styles.previewText}
            />
          )}
        </View>

        {imageUri ? (
          <Button label="Trocar por texto" size="small" variant="outline" onPress={() => setImageUri(null)} />
        ) : (
          <>
            <Text style={styles.label}>Cor de fundo</Text>
            <View style={styles.colors}>
              {STORY_BACKGROUNDS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setBackground(color)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: color === background }}
                  accessibilityLabel={`Cor ${color}`}
                  style={[styles.color, { backgroundColor: color }, color === background && styles.colorSelected]}
                />
              ))}
            </View>
            <Button label="Usar uma foto" size="small" variant="outline" onPress={choosePhoto} />
          </>
        )}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three - Spacing.one,
    alignItems: 'center',
  },
  preview: {
    width: 180,
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  previewText: {
    width: '100%',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 800,
    textAlign: 'center',
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 700,
  },
  colors: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  color: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
  footerButton: {
    flex: 1,
  },
});
