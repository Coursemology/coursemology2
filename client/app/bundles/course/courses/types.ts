import {
  CoursesEntity,
  CoursesListData,
  CoursesPermissions,
} from 'types/course/courses';
import { EntityStore } from 'types/store';

// eslint-disable-next-line import/prefer-default-export
export const SAVE_COURSES_LIST = 'course/achievement/SAVE_COURSES_LIST';

export interface SaveCoursesListAction {
  type: typeof SAVE_COURSES_LIST;
  coursesList: CoursesListData[];
  coursesPermissions: CoursesPermissions;
}

// State Types
export type CoursesActionType = SaveCoursesListAction;

export interface CoursesState {
  courses: EntityStore<CoursesEntity>;
  permissions: CoursesPermissions | null;
}
