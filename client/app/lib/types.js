import PropTypes from 'prop-types';

export const lessonPlanTypesGroups = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string,
    milestone: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object),
  }),
);

export const achievementTypesConditionAttributes = PropTypes.shape({
  new_condition_urls: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ),
  conditions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      edit_url: PropTypes.string,
      delete_url: PropTypes.string,
    }),
  ),
});
