import { createSelector } from 'reselect';

const targetCourseIdSelector = state => state.duplication.targetCourseId;
const targetCoursesSelector = state => state.duplication.targetCourses;

const targetCourseSelector = createSelector(
  targetCourseIdSelector,
  targetCoursesSelector,
  (id, courses) => {
    if (id === null || !courses) { return null; }
    return courses.find(course => course.id === id);
  }
);

export default targetCourseSelector;
