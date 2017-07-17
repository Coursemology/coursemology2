import { defineMessages } from 'react-intl';

const translations = defineMessages({
  component: {
    id: 'course.admin.component',
    defaultMessage: 'Component',
  },
});

export const defaultComponentTitles = defineMessages({
  course_announcements_component: {
    id: 'course.admin.componentTitles.course_announcements_component',
    defaultMessage: 'Announcements',
  },
  course_survey_component: {
    id: 'course.admin.componentTitles.course_survey_component',
    defaultMessage: 'Surveys',
  },
});

export default translations;
