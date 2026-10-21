import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

import { uploadProfilePhoto } from '@/services/profile-photo';
import { useUser } from '@/state/user-context';

/** Abre a galeria, envia a foto escolhida e atualiza a foto de perfil do usuário. */
export function useProfilePhotoPicker() {
  const { updateUser } = useUser();
  const [uploading, setUploading] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) {
      return;
    }

    setUploading(true);
    try {
      const photoUri = await uploadProfilePhoto(result.assets[0].uri);
      updateUser({ photoUri });
    } catch {
      Alert.alert('Não foi possível atualizar a foto', 'Tente novamente em instantes.');
    } finally {
      setUploading(false);
    }
  }

  return { pickPhoto, uploading };
}
