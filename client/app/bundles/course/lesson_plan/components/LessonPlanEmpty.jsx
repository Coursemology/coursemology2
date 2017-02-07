import React from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { grey600 } from 'material-ui/styles/colors';

const translations = defineMessages({
  emptyLessonPlanMessage: {
    id: 'course.lessonPlan.lessonPlan.emptyLessonPlanMessage',
    defaultMessage: 'The lesson plan is empty. Add a new event or milestone via the buttons on the top-right.',
    description: 'Informs user that the lesson plan is empty.',
  },
});

const inlineStyles = {
  emptyLessonPlanMessage: {
    color: grey600,
  },
};

const propTypes = {
  intl: intlShape.isRequired,
};

const LessonPlanEmpty = ({ intl }) => (
  <h4 style={inlineStyles.emptyLessonPlanMessage}>
    {intl.formatMessage(translations.emptyLessonPlanMessage)}
  </h4>
);

LessonPlanEmpty.propTypes = propTypes;

export default injectIntl(LessonPlanEmpty);
