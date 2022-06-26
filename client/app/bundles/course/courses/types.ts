import {
  CourseData,
  CourseEntity,
  CourseListData,
  CourseMiniEntity,
  CoursePermissions,
} from 'types/course/courses';
import { EntityStore } from 'types/store';

// eslint-disable-next-line import/prefer-default-export
export const SAVE_COURSE_LIST = 'course/courses/SAVE_COURSES_LIST';
export const SAVE_COURSE = 'course/courses/SAVE_COURSE';
export const REMOVE_TODO = 'course/courses/REMOVE_TODO';
export const SUBMIT_ENROL = 'course/courses/SUBMIT_ENROL';
export const CANCEL_ENROL = 'course/courses/CANCEL_ENROL';
// Action Types

export interface SaveCoursesListAction {
  type: typeof SAVE_COURSE_LIST;
  coursesList: CourseListData[];
  instanceUserRoleRequestId: number | null;
  coursesPermissions: CoursePermissions;
}

export interface SaveCourseAction {
  type: typeof SAVE_COURSE;
  course: CourseData;
}

export interface RemoveTodoAction {
  type: typeof REMOVE_TODO;
  courseId: number;
  todoType: 'assessments' | 'videos' | 'surveys';
  todoId: number;
}

export interface SubmitEnrolAction {
  type: typeof SUBMIT_ENROL;
  courseId: number;
  id: number;
}

export interface CancelEnrolAction {
  type: typeof CANCEL_ENROL;
  courseId: number;
}

export type CoursesActionType =
  | SaveCoursesListAction
  | SaveCourseAction
  | RemoveTodoAction
  | SubmitEnrolAction
  | CancelEnrolAction;
// State Types

export interface CoursesState {
  courses: EntityStore<CourseMiniEntity, CourseEntity>;
  instanceUserRoleRequestId: number | null;
  permissions: CoursePermissions;
}
