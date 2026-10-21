import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

type AvatarProps = {
  name: string;
  size: number;
  /** Foto do usuário; sem foto, mostra as iniciais. */
  photoUri?: string | null;
  /** Quando informado, mostra o botão de câmera para trocar a foto. */
  onEditPhoto?: () => void;
  /** Mostra um indicador de carregamento sobre a foto. */
  uploading?: boolean;
};

export function Avatar({ name, size, photoUri, onEditPhoto, uploading = false }: AvatarProps) {
  const circle = { width: size, height: size, borderRadius: size / 2 };
  const badgeSize = Math.max(24, Math.round(size * 0.34));

  const content = (
    <View style={[styles.avatar, circle]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={circle} contentFit="cover" accessibilityLabel={name} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
      )}
      {uploading && (
        <View style={[styles.uploading, circle]}>
          <ActivityIndicator color={Colors.onPrimary} />
        </View>
      )}
    </View>
  );

  if (!onEditPhoto) {
    return content;
  }

  return (
    <Pressable
      onPress={onEditPhoto}
      disabled={uploading}
      accessibilityRole="button"
      accessibilityLabel="Alterar foto de perfil"
      style={({ pressed }) => pressed && styles.pressed}>
      {content}
      <View
        style={[
          styles.editBadge,
          { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
        ]}>
        <SymbolView
          name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
          tintColor={Colors.primary}
          size={badgeSize * 0.55}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },
  uploading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
