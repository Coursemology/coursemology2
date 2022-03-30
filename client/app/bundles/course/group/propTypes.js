import PropTypes from 'prop-types';

// Used in the courseUsers array
export const courseUserShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  role: PropTypes.oneOf([
    'owner',
    'manager',
    'student',
    'teaching_assistant',
    'observer',
  ]).isRequired,
  isPhantom: PropTypes.bool.isRequired,
});

export const memberShape = PropTypes.shape({
  id: PropTypes.number.isRequired, // same as course user ID
  groupUserId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  role: PropTypes.oneOf([
    'owner',
    'manager',
    'student',
    'teaching_assistant',
    'observer',
  ]).isRequired,
  isPhantom: PropTypes.bool.isRequired,
  groupRole: PropTypes.oneOf(['manager', 'normal']).isRequired,
});

export const groupShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  members: PropTypes.arrayOf(memberShape).isRequired,
});

export const categoryShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
});
