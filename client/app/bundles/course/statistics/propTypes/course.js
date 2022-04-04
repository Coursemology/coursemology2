import PropTypes from 'prop-types';

import { notificationShape } from 'lib/components/core/NotificationBar';

// eslint-disable-next-line import/prefer-default-export
export const courseIndexShape = PropTypes.shape({
  intl: PropTypes.object.isRequired,
  notification: notificationShape, // Centralised across course, students and staff
});
