import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ProfileBanner } from '@/components/profile/profile-banner';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { PlaynetCoinsBalance } from '@/components/store/playnet-coins-balance';
import { StoreItemCard } from '@/components/store/store-item-card';
import { Colors, Spacing } from '@/constants/theme';
import {
  useCosmeticsStore,
  type CosmeticKind,
  type CosmeticStatus,
} from '@/hooks/use-cosmetics-store';
import { useUser } from '@/state/user-context';

type PendingPurchase = { kind: CosmeticKind; item: { id: string; name: string; price: number } };

export default function LojaScreen() {
  const { user } = useUser();
  const { titles, banners, getStatus, buy, equip } = useCosmeticsStore();
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);

  function confirmPurchase() {
    if (pendingPurchase) {
      buy(pendingPurchase.kind, pendingPurchase.item);
    }
    setPendingPurchase(null);
  }

  function renderAction(kind: CosmeticKind, item: PendingPurchase['item']) {
    const status: CosmeticStatus = getStatus(kind, item);
    switch (status) {
      case 'equipped':
        return (
          <Button label="Em uso" size="small" variant="outline" onPress={() => equip(kind, null)} />
        );
      case 'owned':
        return (
          <Button label="Usar" size="small" variant="outline" onPress={() => equip(kind, item)} />
        );
      case 'available':
        return (
          <Button label="Comprar" size="small" onPress={() => setPendingPurchase({ kind, item })} />
        );
      case 'unaffordable':
        return <Button label="Comprar" size="small" disabled />;
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Loja" />

      <ScreenScrollView>
        <View style={styles.section}>
          <PlaynetCoinsBalance amount={user.playnetCoins} />
        </View>

        <Text style={[styles.section, styles.sectionTitle]}>Produtos reais</Text>
        <Text style={[styles.section, styles.sectionSubtitle]}>
          Troque suas Playnet Coins por produtos físicos.
        </Text>
        <View style={[styles.section, styles.sectionContent]}>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonEmoji}>🎁</Text>
            <Text style={styles.comingSoonTitle}>Em breve</Text>
            <Text style={styles.comingSoonText}>
              Promoções de bolas, raquetes e acessórios vão aparecer aqui.
            </Text>
          </View>
        </View>

        <Text style={[styles.section, styles.sectionTitle]}>Títulos</Text>
        <Text style={[styles.section, styles.sectionSubtitle]}>
          Compre um título e exiba no seu perfil.
        </Text>
        <View style={[styles.section, styles.sectionContent]}>
          {titles.map((title) => (
            <StoreItemCard
              key={title.id}
              emoji={title.emoji}
              name={title.name}
              description={title.description}
              price={title.price}
              action={renderAction('title', title)}
            />
          ))}
        </View>

        <Text style={[styles.section, styles.sectionTitle]}>Banners de perfil</Text>
        <Text style={[styles.section, styles.sectionSubtitle]}>
          Escolha o fundo do topo do seu perfil.
        </Text>
        <View style={[styles.section, styles.sectionContent]}>
          {banners.map((banner) => (
            <StoreItemCard
              key={banner.id}
              cover={<ProfileBanner bannerId={banner.id} style={styles.bannerPreview} />}
              name={`${banner.name} · ${banner.sport}`}
              description={banner.description}
              price={banner.price}
              action={renderAction('banner', banner)}
            />
          ))}
        </View>
      </ScreenScrollView>

      <ConfirmDialog
        visible={pendingPurchase !== null}
        title="Confirmar compra"
        message={
          pendingPurchase
            ? `Comprar ${pendingPurchase.kind === 'title' ? 'o título' : 'o banner'} "${pendingPurchase.item.name}" por ${pendingPurchase.item.price.toLocaleString('pt-BR')} Playnet Coins?`
            : ''
        }
        confirmLabel="Comprar"
        onConfirm={confirmPurchase}
        onCancel={() => setPendingPurchase(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.four,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: 800,
    marginTop: Spacing.five,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.one,
  },
  sectionContent: {
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.three,
  },
  bannerPreview: {
    height: 84,
  },
  comingSoon: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: '#FDF3F0',
  },
  comingSoonEmoji: {
    fontSize: 32,
  },
  comingSoonTitle: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: 800,
  },
  comingSoonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
