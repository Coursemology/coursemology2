import PropTypes from 'prop-types';

export const lessonPlanTypesGroups = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string,
    milestone: PropTypes.object,
    items: PropTypes.arrayOf({}),
  })
);

export const achievementTypesConditionAttributes = PropTypes.shape({
  new_condition_urls: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    })
  ),
  conditions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      edit_url: PropTypes.string,
      delete_url: PropTypes.string,
    })
  ),
});

export const typeMaterial = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    updated_at: PropTypes.string,
  })
);
