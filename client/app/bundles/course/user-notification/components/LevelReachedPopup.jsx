import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { Avatar, Button } from '@material-ui/core';
import { deepOrange, yellow } from '@mui/material/colors';
import Star from '@material-ui/icons/Star';
import { getCourseId } from 'lib/helpers/url-helpers';
import Popup from 'course/user-notification/components/Popup';

const translations = defineMessages({
  reached: {
    id: 'course.userNotification.LevelReachedPopup.reached',
    defaultMessage: 'Level {levelNumber} Reached!',
  },
  leaderboard: {
    id: 'course.userNotification.LevelReachedPopup.leaderboard',
    defaultMessage: 'Leaderboard',
  },
  leaderboardMessage: {
    id: 'course.userNotification.LevelReachedPopup.leaderboardMessage',
    defaultMessage:
      'You are currently at position {position} on the leaderboard. Good work!',
  },
});

const styles = {
  avatar: {
    backgroundColor: deepOrange[400],
    color: yellow[500],
    height: '200px',
    width: '200px',
  },
  leaderboardMessage: {
    textAlign: 'center',
    marginTop: 30,
  },
  starSvg: {
    height: '200px',
    width: '200px',
  },
};

const LevelReachedPopup = ({ notification, onDismiss, intl }) => {
  const leaderboardButton = notification.leaderboardEnabled ? (
    <Button
      color="primary"
      key="leaderboard-button"
      onClick={() => {
        onDismiss();
        window.location.href = `/courses/${getCourseId()}/leaderboard`;
      }}
    >
      {intl.formatMessage(translations.leaderboard)}
    </Button>
  ) : null;

  return (
    <Popup
      title={intl.formatMessage(translations.reached, {
        levelNumber: notification.levelNumber,
      })}
      actionButtons={[leaderboardButton]}
      onDismiss={onDismiss}
    >
      <Avatar style={styles.avatar}>
        <Star style={styles.starSvg} />
      </Avatar>
      {notification.leaderboardEnabled && notification.leaderboardPosition ? (
        <p style={styles.leaderboardMessage}>
          {intl.formatMessage(translations.leaderboardMessage, {
            position: notification.leaderboardPosition,
          })}
        </p>
      ) : null}
    </Popup>
  );
};

LevelReachedPopup.propTypes = {
  notification: PropTypes.shape({
    levelNumber: PropTypes.number,
    leaderboardEnabled: PropTypes.bool,
    leaderboardPosition: PropTypes.number,
  }),
  onDismiss: PropTypes.func,

  intl: intlShape,
};

export default injectIntl(LevelReachedPopup);
