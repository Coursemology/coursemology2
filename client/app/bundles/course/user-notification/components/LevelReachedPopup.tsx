import Star from '@mui/icons-material/Star';
import { Avatar, Button } from '@mui/material';
import { LevelReachedNotification } from 'types/course/userNotifications';

import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import PopupDialog from './PopupDialog';

interface LevelReachedPopupProps {
  notification: LevelReachedNotification;
  onDismiss: () => void;
}

const LevelReachedPopup = (props: LevelReachedPopupProps): JSX.Element => {
  const { notification, onDismiss } = props;

  const { t } = useTranslation();

  const leaderboardButton = notification.leaderboardEnabled && (
    <Button
      key="leaderboard-button"
      color="primary"
      onClick={(): void => {
        onDismiss();
        window.location.href = `/courses/${getCourseId()}/leaderboard`;
      }}
    >
      {t(translations.leaderboard)}
    </Button>
  );

  return (
    <PopupDialog
      actionButtons={[leaderboardButton]}
      onDismiss={onDismiss}
      title={t(translations.reached, {
        levelNumber: notification.levelNumber,
      })}
    >
      <Avatar className="bg-orange-500 text-yellow-300 wh-80">
        <Star className="wh-80" />
      </Avatar>

      {notification.leaderboardEnabled && notification.leaderboardPosition && (
        <p className="mt-12 text-center">
          {t(translations.leaderboardMessage, {
            position: notification.leaderboardPosition,
          })}
        </p>
      )}
    </PopupDialog>
  );
};

export default LevelReachedPopup;
