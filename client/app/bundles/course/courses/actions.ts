import { CoursesListData, CoursesPermissions } from 'types/course/courses';
import { SAVE_COURSES_LIST, SaveCoursesListAction } from './types';

// eslint-disable-next-line import/prefer-default-export
export function saveCoursesList(
  coursesList: CoursesListData[],
  coursesPermissions: CoursesPermissions,
): SaveCoursesListAction {
  return {
    type: SAVE_COURSES_LIST,
    coursesList,
    coursesPermissions,
  };
}
