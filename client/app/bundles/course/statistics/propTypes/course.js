import PropTypes from 'prop-types';

import { notificationShape } from 'lib/components/NotificationBar';
import { intlShape } from 'react-intl';

// eslint-disable-next-line import/prefer-default-export
export const courseIndexShape = PropTypes.shape({
  intl: intlShape.isRequired,
  notification: notificationShape, // Centralised across course, students and staff
});
