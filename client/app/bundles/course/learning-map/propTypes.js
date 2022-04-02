import PropTypes from 'prop-types';

export const relatedNodeShape = PropTypes.shape({
  id: PropTypes.string,
  is_satisfied: PropTypes.bool,
});

export const nodeShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  unlocked: PropTypes.bool.isRequired,
  satisfiability_type: PropTypes.string.isRequired,
  course_material_type: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
  children: PropTypes.arrayOf(relatedNodeShape).isRequired,
  parents: PropTypes.arrayOf(relatedNodeShape).isRequired,
  unlock_rate: PropTypes.number.isRequired,
  unlock_level: PropTypes.number.isRequired,
});

export const responseShape = PropTypes.shape({
  didSucceed: PropTypes.bool,
  message: PropTypes.string,
});

export const selectedElementShape = PropTypes.shape({
  id: PropTypes.string,
  type: PropTypes.string,
});

export const arrowProperties = PropTypes.shape({
  defaultColor: PropTypes.string,
  headSize: PropTypes.string,
  selectColor: PropTypes.string,
  strokeWidth: PropTypes.string,
});
