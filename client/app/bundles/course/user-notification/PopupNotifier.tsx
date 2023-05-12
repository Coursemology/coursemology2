import { ElementType, useEffect, useState } from 'react';
import {
  UserNotificationData,
  UserNotificationType,
} from 'types/course/userNotifications';

import AchievementGainedPopup from './components/AchievementGainedPopup';
import LevelReachedPopup from './components/LevelReachedPopup';
import { fetchNotifications, markAsRead } from './operations';

const POPUPS: Record<UserNotificationType, ElementType> = {
  achievementGained: AchievementGainedPopup,
  levelReached: LevelReachedPopup,
};

const PopupNotifier = (): JSX.Element | null => {
  const [notification, setNotification] = useState<UserNotificationData>();

  useEffect(() => {
    fetchNotifications().then(setNotification);
  }, []);

  if (!notification) return null;

  const Popup = POPUPS[notification.notificationType];
  if (!Popup)
    throw new Error(
      `Unknown notification type: ${notification.notificationType}`,
    );

  return (
    <Popup
      notification={notification}
      onDismiss={(): void => {
        markAsRead(notification.id)
          .then(setNotification)
          .catch(() => setNotification(undefined));
      }}
    />
  );
};

export default PopupNotifier;
