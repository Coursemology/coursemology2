import { defineMessages } from 'react-intl';

const translations = defineMessages({
  fetchCourseFailure: {
    id: 'course.courses.CourseShow.fetchCourseFailure',
    defaultMessage: 'Failed to fetch information of the course.',
  },
  suspendedSubtitle: {
    id: 'app.ErrorPage.suspendedSubtitle',
    defaultMessage: 'Please contact your instructors or the course staff.',
  },
});

export default translations;
