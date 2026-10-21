import { STORE_BANNERS, STORE_TITLES } from '@/data/store';
import type { User } from '@/data/user';
import { useUser } from '@/state/user-context';

/** Tipos de cosmético vendidos na Loja. */
export type CosmeticKind = 'title' | 'banner';

export type CosmeticStatus = 'available' | 'unaffordable' | 'owned' | 'equipped';

type Cosmetic = { id: string; price: number };

// Campos do usuário que guardam, para cada tipo, os itens comprados e o item em uso.
const OWNED_FIELD = { title: 'ownedTitles', banner: 'ownedBanners' } as const satisfies Record<
  CosmeticKind,
  keyof User
>;
const CURRENT_FIELD = { title: 'currentTitle', banner: 'currentBanner' } as const satisfies Record<
  CosmeticKind,
  keyof User
>;

/** Compra e uso de cosméticos (títulos e banners) com Playnet Coins. */
export function useCosmeticsStore() {
  const { user, updateUser } = useUser();

  function getStatus(kind: CosmeticKind, item: Cosmetic): CosmeticStatus {
    if (user[CURRENT_FIELD[kind]] === item.id) return 'equipped';
    if (user[OWNED_FIELD[kind]].includes(item.id)) return 'owned';
    return user.playnetCoins >= item.price ? 'available' : 'unaffordable';
  }

  function buy(kind: CosmeticKind, item: Cosmetic) {
    if (getStatus(kind, item) !== 'available') return;
    updateUser({
      playnetCoins: user.playnetCoins - item.price,
      [OWNED_FIELD[kind]]: [...user[OWNED_FIELD[kind]], item.id],
    });
  }

  /** Passa a exibir o item no perfil; `null` remove o atual. */
  function equip(kind: CosmeticKind, item: Cosmetic | null) {
    updateUser({ [CURRENT_FIELD[kind]]: item?.id ?? null });
  }

  return {
    titles: STORE_TITLES,
    banners: STORE_BANNERS,
    currentTitle: STORE_TITLES.find((title) => title.id === user.currentTitle) ?? null,
    currentBanner: STORE_BANNERS.find((banner) => banner.id === user.currentBanner) ?? null,
    getStatus,
    buy,
    equip,
  };
}
