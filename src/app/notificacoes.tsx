import { StyleSheet, Text, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Colors, Spacing } from '@/constants/theme';
import { MOCK_NOTIFICATIONS, type AppNotification } from '@/data/notifications';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';

export default function NotificacoesScreen() {
  useLightStatusBar();

  return (
    <ScreenScrollView withTabBar={false}>
      {MOCK_NOTIFICATIONS.length > 0 ? (
        <View style={styles.list}>
          {MOCK_NOTIFICATIONS.map((notification, index) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              isLast={index === MOCK_NOTIFICATIONS.length - 1}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Você não tem notificações.</Text>
      )}
    </ScreenScrollView>
  );
}

function NotificationRow({
  notification,
  isLast,
}: {
  notification: AppNotification;
  isLast: boolean;
}) {
  return (
    <View
      style={[styles.row, notification.unread && styles.unreadRow, !isLast && styles.divider]}
      accessible
      accessibilityLabel={`${notification.unread ? 'Não lida. ' : ''}${notification.title}. ${notification.body}. ${notification.time}`}>
      <View style={styles.emojiCircle}>
        <Text style={styles.emoji}>{notification.emoji}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.body}>{notification.body}</Text>
        <Text style={styles.time}>{notification.time}</Text>
      </View>
      {notification.unread && <View style={styles.unreadDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginHorizontal: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    backgroundColor: Colors.background,
  },
  unreadRow: {
    backgroundColor: '#FDF3F0',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 700,
  },
  body: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: Spacing.one + Spacing.half,
  },
  empty: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
