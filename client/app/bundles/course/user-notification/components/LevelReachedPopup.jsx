import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import StarIcon from 'material-ui/svg-icons/toggle/star';
import { deepOrange400, yellow500 } from 'material-ui/styles/colors';
import Popup from 'course/user-notification/components/Popup';

const translations = defineMessages({
  reached: {
    id: 'course.userNotification.LevelReachedPopup.reached',
    defaultMessage: 'Level {levelNumber} Reached!',
  },
});

const LevelReachedPopup = ({ notification, onDismiss, intl }) => (
  <Popup
    title={intl.formatMessage(translations.reached, { levelNumber: notification.levelNumber })}
    onDismiss={onDismiss}
  >
    <Avatar
      size={200}
      color={yellow500}
      backgroundColor={deepOrange400}
      icon={<StarIcon />}
    />
  </Popup>
);

LevelReachedPopup.propTypes = {
  notification: PropTypes.shape({
    levelNumber: PropTypes.number,
  }),
  onDismiss: PropTypes.func,

  intl: intlShape,
};

export default injectIntl(LevelReachedPopup);
