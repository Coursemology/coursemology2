import { createSelector } from '@reduxjs/toolkit';

const destinationCourseIdSelector = (state) =>
  state.duplication.destinationCourseId;
const destinationCoursesSelector = (state) =>
  state.duplication.destinationCourses;

const destinationCourseSelector = createSelector(
  destinationCourseIdSelector,
  destinationCoursesSelector,
  (id, courses) => {
    if (id === null || !courses) {
      return null;
    }
    return courses.find((course) => course.id === id);
  },
);

export default destinationCourseSelector;
