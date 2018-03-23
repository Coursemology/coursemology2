import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { duplicableItemTypes } from 'course/duplication/constants';

const styles = {
  badge: {
    padding: '2px 5px',
    marginRight: 10,
    borderStyle: 'solid',
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 12,
  },
};

const translations = defineMessages({
  [duplicableItemTypes.ASSESSMENT]: {
    id: 'course.duplication.TypeBadge.assessment',
    defaultMessage: 'Assessment',
  },
  [duplicableItemTypes.CATEGORY]: {
    id: 'course.duplication.TypeBadge.category',
    defaultMessage: 'Category',
  },
  [duplicableItemTypes.TAB]: {
    id: 'course.duplication.TypeBadge.tab',
    defaultMessage: 'Tab',
  },
  [duplicableItemTypes.SURVEY]: {
    id: 'course.duplication.TypeBadge.survey',
    defaultMessage: 'Survey',
  },
  [duplicableItemTypes.ACHIEVEMENT]: {
    id: 'course.duplication.TypeBadge.achievement',
    defaultMessage: 'Achievement',
  },
  [duplicableItemTypes.FOLDER]: {
    id: 'course.duplication.TypeBadge.folder',
    defaultMessage: 'Folder',
  },
  [duplicableItemTypes.MATERIAL]: {
    id: 'course.duplication.TypeBadge.material',
    defaultMessage: 'Material',
  },
  [duplicableItemTypes.VIDEO]: {
    id: 'course.duplication.TypeBadge.video',
    defaultMessage: 'Video',
  },
  [duplicableItemTypes.VIDEO_TAB]: {
    id: 'course.duplication.TypeBadge.video_tab',
    defaultMessage: 'Tab',
  },
});

const TypeBadge = ({ text, itemType }) => (
  <span style={styles.badge}>
    { text || <FormattedMessage {...translations[itemType]} /> }
  </span>
);

TypeBadge.propTypes = {
  text: PropTypes.string,
  itemType: PropTypes.string,
};

export default TypeBadge;
