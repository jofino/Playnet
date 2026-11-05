import * as ImagePicker from 'expo-image-picker';

/** Abre a galeria e devolve a imagem escolhida (ou `null` se o usuário cancelar). */
export async function pickImage(aspect?: [number, number]) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: aspect !== undefined,
    aspect,
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}
