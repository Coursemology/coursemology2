import { Avatar, Typography } from '@mui/material';
import { AchievementGainedNotification } from 'types/course/userNotifications';

import { getAchievementBadgeUrl } from 'course/helper/achievements';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import PopupDialog from './PopupDialog';

interface AchievementGainedPopupProps {
  notification: AchievementGainedNotification;
  onDismiss: () => void;
}

const AchievementGainedPopup = (
  props: AchievementGainedPopupProps,
): JSX.Element => {
  const { notification, onDismiss } = props;

  const { t } = useTranslation();

  return (
    <PopupDialog onDismiss={onDismiss} title={t(translations.unlocked)}>
      <Avatar
        alt={notification.title}
        className="mb-6 wh-96"
        src={getAchievementBadgeUrl(notification.badgeUrl, true)}
        variant="square"
      />

      <Typography className="mb-2" variant="h6">
        {notification.title}
      </Typography>

      <UserHTMLText className="text-center" html={notification.description} />
    </PopupDialog>
  );
};

export default AchievementGainedPopup;
