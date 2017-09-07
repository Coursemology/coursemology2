import { defineMessages } from 'react-intl';

const translations = defineMessages({
  component: {
    id: 'course.component',
    defaultMessage: 'Component',
  },
});

export const defaultComponentTitles = defineMessages({
  course_announcements_component: {
    id: 'course.componentTitles.course_announcements_component',
    defaultMessage: 'Announcements',
  },
  course_survey_component: {
    id: 'course.componentTitles.course_survey_component',
    defaultMessage: 'Surveys',
  },
  course_users_component: {
    id: 'course.componentTitles.course_users_component',
    defaultMessage: 'Users',
  },
  course_forums_component: {
    id: 'course.componentTitles.course_forums_component',
    defaultMessage: 'Forums',
  },
});

export default translations;
