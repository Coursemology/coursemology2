import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { deepOrange400, yellow500 } from 'material-ui/styles/colors';
import StarIcon from 'material-ui/svg-icons/toggle/star';
import PropTypes from 'prop-types';

import Popup from 'course/user-notification/components/Popup';
import { getCourseId } from 'lib/helpers/url-helpers';

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
  leaderboardMessage: {
    textAlign: 'center',
    marginTop: 30,
  },
};

const LevelReachedPopup = ({ notification, onDismiss, intl }) => {
  const leaderboardButton = notification.leaderboardEnabled ? (
    <FlatButton
      label={intl.formatMessage(translations.leaderboard)}
      onClick={() => {
        onDismiss();
        window.location.href = `/courses/${getCourseId()}/leaderboard`;
      }}
      primary={true}
    />
  ) : null;

  return (
    <Popup
      actionButtons={[leaderboardButton]}
      onDismiss={onDismiss}
      title={intl.formatMessage(translations.reached, {
        levelNumber: notification.levelNumber,
      })}
    >
      <Avatar
        backgroundColor={deepOrange400}
        color={yellow500}
        icon={<StarIcon />}
        size={200}
      />
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
