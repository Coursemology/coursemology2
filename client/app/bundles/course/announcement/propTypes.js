import PropTypes from 'prop-types';

export const announcementShape = PropTypes.shape({
  title: PropTypes.string,
  content: PropTypes.string,
  sticky: PropTypes.bool,
  start_at: PropTypes.string,
  end_at: PropTypes.string,
  id: PropTypes.number,
  creator: PropTypes.string,
  unread: PropTypes.bool,
  linkToUser: PropTypes.string,
  formatedDateTime: PropTypes.string,
  timePeriodMessage: PropTypes.string,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  currentlyActive: PropTypes.bool,
  timePeriodClasses: PropTypes.arrayOf(PropTypes.string),
  unreadClasses: PropTypes.arrayOf(PropTypes.string),
});

export default 'announcementShape';
