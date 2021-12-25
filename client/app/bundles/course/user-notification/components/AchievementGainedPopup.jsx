import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';

import Popup from 'course/user-notification/components/Popup';

const styles = {
  badge: {
    maxHeight: 250,
    maxWidth: 250,
  },
  title: {
    marginTop: 30,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
  },
};

const translations = defineMessages({
  unlocked: {
    id: 'course.userNotification.AchievementGainedPopup.unlocked',
    defaultMessage: 'Achievement Unlocked!',
  },
});

const AchievementGainedPopup = ({ notification, onDismiss, intl }) => (
  <Popup
    onDismiss={onDismiss}
    title={intl.formatMessage(translations.unlocked)}
  >
    <img
      alt={notification.title}
      src={notification.badgeUrl}
      style={styles.badge}
    />
    <span style={styles.title}>{notification.title}</span>
    <span
      dangerouslySetInnerHTML={{ __html: notification.description }}
      style={styles.description}
    />
  </Popup>
);

AchievementGainedPopup.propTypes = {
  notification: PropTypes.shape({
    badgeUrl: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  onDismiss: PropTypes.func,

  intl: intlShape,
};

export default injectIntl(AchievementGainedPopup);
