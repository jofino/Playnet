import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { Colors, Spacing } from '@/constants/theme';
import { POST_MAX_LENGTH } from '@/data/community';
import { createPost } from '@/lib/comunidade';
import { getDataErrorMessage } from '@/lib/data-errors';

type PostComposerSheetProps = {
  onClose: () => void;
  onPublished: () => void;
};

/** Nova publicação, só de texto. */
export function PostComposerSheet({ onClose, onPublished }: PostComposerSheetProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();
  const canPublish = trimmed !== '' && trimmed.length <= POST_MAX_LENGTH;

  async function publish() {
    if (!canPublish || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await createPost(trimmed);
      onPublished();
      onClose();
    } catch (failure) {
      setError(getDataErrorMessage(failure));
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      visible
      title="Nova publicação"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} disabled={submitting} style={styles.footerButton} />
          <Button
            label="Publicar"
            onPress={publish}
            disabled={!canPublish || submitting}
            icon={submitting ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : undefined}
            style={styles.footerButton}
          />
        </>
      }>
      <View style={styles.content}>
        <TextInput
          value={text}
          onChangeText={setText}
          editable={!submitting}
          placeholder="Conte como foi o jogo, procure parceiros, compartilhe dicas…"
          placeholderTextColor={Colors.textSecondary}
          multiline
          maxLength={POST_MAX_LENGTH}
          accessibilityLabel="Texto da publicação"
          style={styles.input}
        />
        <Text style={styles.counter}>
          {text.length}/{POST_MAX_LENGTH}
        </Text>
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
  error: {
    color: '#D92D20',
    fontSize: 13,
  },
  footerButton: {
    flex: 1,
  },
});
