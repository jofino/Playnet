import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Sheet } from '@/components/sheet';
import { TextField } from '@/components/text-field';
import { Colors, Spacing } from '@/constants/theme';
import { STORE_BANNERS, STORE_TITLES } from '@/data/store';
import { useProfilePhotoPicker } from '@/hooks/use-profile-photo-picker';
import { useUser } from '@/state/user-context';

/** Edição de foto, nome, localização e dos cosméticos (título e banner) exibidos no perfil. */
export function EditProfileSheet({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useUser();
  const { pickPhoto, uploading } = useProfilePhotoPicker();
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location ?? '');
  const [title, setTitle] = useState(user.currentTitle);
  const [banner, setBanner] = useState(user.currentBanner);

  const ownedTitles = STORE_TITLES.filter((item) => user.ownedTitles.includes(item.id));
  const ownedBanners = STORE_BANNERS.filter((item) => user.ownedBanners.includes(item.id));
  const nameError = name.trim() === '' ? 'Informe seu nome.' : undefined;

  function save() {
    if (nameError) return;
    updateUser({
      name: name.trim(),
      location: location.trim() || null,
      currentTitle: title,
      currentBanner: banner,
    });
    onClose();
  }

  return (
    <Sheet
      visible
      title="Editar perfil"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Salvar" onPress={save} disabled={!!nameError} style={styles.footerButton} />
        </>
      }>
      <View style={styles.content}>
        {/* A foto é enviada e salva assim que escolhida. */}
        <View style={styles.photo}>
          <Avatar
            name={name.trim() || user.name}
            size={88}
            photoUri={user.photoUri}
            onEditPhoto={pickPhoto}
            uploading={uploading}
          />
          <Text style={styles.photoHint}>Toque na foto para trocar</Text>
        </View>

        <TextField
          label="Nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          error={nameError}
        />
        <TextField
          label="Localização"
          value={location}
          onChangeText={setLocation}
          placeholder="Ex.: São Paulo, SP"
          autoCapitalize="words"
        />

        <View style={styles.group}>
          <Text style={styles.label}>Título exibido</Text>
          {ownedTitles.length > 0 ? (
            <View style={styles.options}>
              <Chip label="Nenhum" selected={title === null} onPress={() => setTitle(null)} />
              {ownedTitles.map((item) => (
                <Chip
                  key={item.id}
                  label={`${item.emoji} ${item.name}`}
                  selected={title === item.id}
                  onPress={() => setTitle(item.id)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>Compre títulos na Loja para exibir no seu perfil.</Text>
          )}
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Banner</Text>
          {ownedBanners.length > 0 ? (
            <View style={styles.options}>
              <Chip label="Padrão" selected={banner === null} onPress={() => setBanner(null)} />
              {ownedBanners.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  selected={banner === item.id}
                  onPress={() => setBanner(item.id)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>Compre banners na Loja para personalizar o topo do perfil.</Text>
          )}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  photo: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  photoHint: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  group: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 700,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerButton: {
    flex: 1,
  },
});
