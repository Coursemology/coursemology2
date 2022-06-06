import {
  CourseMiniEntity,
  CourseListData,
  CoursePermissions,
} from 'types/course/courses';
import { EntityStore } from 'types/store';

// eslint-disable-next-line import/prefer-default-export
export const SAVE_COURSE_LIST = 'course/achievement/SAVE_COURSES_LIST';
// Action Types

export interface SaveCoursesListAction {
  type: typeof SAVE_COURSE_LIST;
  coursesList: CourseListData[];
  instanceUserRoleRequestId: number | null;
  coursesPermissions: CoursePermissions;
}

export type CoursesActionType = SaveCoursesListAction;
// State Types

export interface CoursesState {
  courses: EntityStore<CourseMiniEntity>;
  instanceUserRoleRequestId: number | null;
  permissions: CoursePermissions;
}
