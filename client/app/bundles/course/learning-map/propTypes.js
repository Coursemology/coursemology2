import PropTypes from 'prop-types';

export const relatedNodeShape = PropTypes.shape({
  id: PropTypes.string,
  isSatisfied: PropTypes.bool,
});

export const nodeShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  unlocked: PropTypes.bool.isRequired,
  satisfiabilityType: PropTypes.string.isRequired,
  courseMaterialType: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
  children: PropTypes.arrayOf(relatedNodeShape).isRequired,
  parents: PropTypes.arrayOf(relatedNodeShape).isRequired,
  unlockRate: PropTypes.number.isRequired,
  unlockLevel: PropTypes.number.isRequired,
});

export const responseShape = PropTypes.shape({
  didSucceed: PropTypes.bool,
  message: PropTypes.string,
});

export const selectedElementShape = PropTypes.shape({
  id: PropTypes.string,
  type: PropTypes.string,
});

export const arrowPropertiesShape = PropTypes.shape({
  defaultColor: PropTypes.string,
  headSize: PropTypes.number,
  selectColor: PropTypes.string,
  strokeWidth: PropTypes.number,
});
