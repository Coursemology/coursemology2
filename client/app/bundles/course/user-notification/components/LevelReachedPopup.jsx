import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import StarIcon from 'material-ui/svg-icons/toggle/star';
import { deepOrange400, yellow500 } from 'material-ui/styles/colors';
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
    defaultMessage: 'You are currently at position {position} on the leaderboard. Good work!',
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
      primary
      label={intl.formatMessage(translations.leaderboard)}
      onClick={() => {
        onDismiss();
        window.location.href = `/courses/${getCourseId()}/leaderboard`;
      }}
    />
  ) : null;

  return (
    <Popup
      title={intl.formatMessage(translations.reached, { levelNumber: notification.levelNumber })}
      actionButtons={[leaderboardButton]}
      onDismiss={onDismiss}
    >
      <Avatar
        size={200}
        color={yellow500}
        backgroundColor={deepOrange400}
        icon={<StarIcon />}
      />
      {
        notification.leaderboardEnabled && notification.leaderboardPosition
          ? (
            <p style={styles.leaderboardMessage}>
              { intl.formatMessage(translations.leaderboardMessage, { position: notification.leaderboardPosition }) }
            </p>
          ) : null
      }
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
