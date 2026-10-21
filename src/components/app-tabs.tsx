import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Colors.background}
      tintColor={Colors.primary}
      iconColor={{ default: Colors.textSecondary, selected: Colors.primary }}
      indicatorColor={Colors.primarySoft}
      rippleColor={Colors.primarySoft}
      labelStyle={{
        default: { color: Colors.textSecondary },
        selected: { color: Colors.primary, fontWeight: '600' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Loja</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="storefront" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="comunidade">
        <NativeTabs.Trigger.Label>Comunidade</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} md="groups" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="jogar">
        <NativeTabs.Trigger.Label>Jogar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sportscourt', selected: 'sportscourt.fill' }}
          md="sports_tennis"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ranking">
        <NativeTabs.Trigger.Label>Ranking</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'trophy', selected: 'trophy.fill' }}
          md="leaderboard"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
