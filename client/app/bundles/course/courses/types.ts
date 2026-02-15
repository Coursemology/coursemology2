import {
  CourseData,
  CourseEntity,
  CourseListData,
  CourseMiniEntity,
  CoursePermissions,
} from 'types/course/courses';
import { EntityStore } from 'types/store';
import { RoleRequestBasicListData } from 'types/system/instance/roleRequests';

export const SAVE_COURSE_LIST = 'course/courses/SAVE_COURSE_LIST';
export const SAVE_COURSE = 'course/courses/SAVE_COURSE';
export const REMOVE_TODO = 'course/courses/REMOVE_TODO';
export const SUBMIT_ENROL = 'course/courses/SUBMIT_ENROL';
export const CANCEL_ENROL = 'course/courses/CANCEL_ENROL';
export const SAVE_INSTANCE_ROLE_REQUEST = 'instance/SAVE_INSTANCE_ROLE_REQUEST';
// Action Types

export interface SaveCourseListAction {
  type: typeof SAVE_COURSE_LIST;
  courseList: CourseListData[];
  instanceUserRoleRequest?: RoleRequestBasicListData;
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
  status: string;
}

export interface CancelEnrolAction {
  type: typeof CANCEL_ENROL;
  courseId: number;
}

export interface SaveInstanceRoleRequest {
  type: typeof SAVE_INSTANCE_ROLE_REQUEST;
  instanceUserRoleRequest: RoleRequestBasicListData;
}

export type CoursesActionType =
  | SaveCourseListAction
  | SaveCourseAction
  | RemoveTodoAction
  | SubmitEnrolAction
  | CancelEnrolAction
  | SaveInstanceRoleRequest;
// State Types

export interface CoursesState {
  courses: EntityStore<CourseMiniEntity, CourseEntity>;
  instanceUserRoleRequest?: RoleRequestBasicListData;
  permissions: CoursePermissions;
}
