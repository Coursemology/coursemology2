import { CourseListData, CoursePermissions } from 'types/course/courses';
import { SAVE_COURSE_LIST, SaveCoursesListAction } from './types';

// eslint-disable-next-line import/prefer-default-export
export function saveCoursesList(
  coursesList: CourseListData[],
  instanceUserRoleRequestId: number,
  coursesPermissions: CoursePermissions,
): SaveCoursesListAction {
  return {
    type: SAVE_COURSE_LIST,
    coursesList,
    instanceUserRoleRequestId,
    coursesPermissions,
  };
}
